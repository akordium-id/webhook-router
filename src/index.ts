import { Hono } from "hono"
import type { Bindings } from "./types"
import { resolveTargetUrl } from "./router"

const app = new Hono<{ Bindings: Bindings }>()

// Root information endpoint
app.get("/", (c) => {
  return c.json({
    name: "Akordium Webhook Router",
    description: "Centralized webhook router for Akordium Lab SaaS and services",
    status: "active",
    endpoints: {
      health: "GET /health",
      xendit: "POST /xendit",
      midtrans: "POST /midtrans",
    },
    documentation: "https://github.com/akordium-id/akordium-webhook-router",
  })
})

// Health check endpoint
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: "akordium-webhook-router",
    timestamp: new Date().toISOString(),
  })
})

// Xendit Webhook Handler
app.post("/xendit", async (c) => {
  const token = c.req.header("x-callback-token")
  const expectedToken = c.env.XENDIT_WEBHOOK_TOKEN

  if (expectedToken && token !== expectedToken) {
    return c.json({ error: "Invalid callback token" }, 401)
  }

  let body: Record<string, unknown>
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400)
  }

  const externalId = (body.external_id || body.id) as string | undefined
  const match = resolveTargetUrl(externalId, c.env)

  if (!match) {
    return c.json(
      {
        error: "Target service not found for external_id",
        externalId,
      },
      404,
    )
  }

  // Handle dummy test simulation
  if (match.targetUrl === "TEST_SIMULATION") {
    return c.json({
      status: "ok",
      message: "Test webhook verified by akordium-webhook-router",
    })
  }

  // Forward request to destination SaaS
  try {
    const headers = new Headers(c.req.raw.headers)
    // Hindari header host bawaan Cloudflare Worker menimpa target
    headers.delete("host")

    const res = await fetch(match.targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })

    const responseText = await res.text()
    return new Response(responseText, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") || "application/json",
      },
    })
  } catch (err) {
    return c.json(
      {
        error: "Failed to forward webhook to downstream service",
        product: match.product,
        message: (err as Error).message,
      },
      502,
    )
  }
})

// Midtrans Webhook Handler
app.post("/midtrans", async (c) => {
  let body: Record<string, unknown>
  try {
    body = await c.req.json()
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400)
  }

  const orderId = body.order_id as string | undefined
  const match = resolveTargetUrl(orderId, c.env)

  if (!match) {
    return c.json(
      {
        error: "Target service not found for order_id",
        orderId,
      },
      404,
    )
  }

  // Forward request to destination SaaS
  try {
    const headers = new Headers(c.req.raw.headers)
    headers.delete("host")

    const res = await fetch(match.targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })

    const responseText = await res.text()
    return new Response(responseText, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") || "application/json",
      },
    })
  } catch (err) {
    return c.json(
      {
        error: "Failed to forward webhook to downstream service",
        product: match.product,
        message: (err as Error).message,
      },
      502,
    )
  }
})

export default app
