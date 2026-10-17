import { describe, it, expect } from "vitest"
import { resolveTargetUrl } from "../src/router"

describe("resolveTargetUrl", () => {
  const env = {
    VISTEO_WEBHOOK_URL: "https://visteo-app.akordium.id/api/payment/webhook",
    CRM_WEBHOOK_URL: "https://crm.akordium.id/api/payment/webhook",
  }

  it("resolves visteo prefix correctly", () => {
    const res = resolveTargetUrl("visteo-evt123-1700000000", env)
    expect(res).not.toBeNull()
    expect(res?.product).toBe("visteo")
    expect(res?.targetUrl).toBe("https://visteo-app.akordium.id/api/payment/webhook")
  })

  it("resolves crm prefix correctly", () => {
    const res = resolveTargetUrl("crm_order_456", env)
    expect(res).not.toBeNull()
    expect(res?.product).toBe("crm")
    expect(res?.targetUrl).toBe("https://crm.akordium.id/api/payment/webhook")
  })

  it("resolves xendit test simulation prefix", () => {
    const res = resolveTargetUrl("invoice_123124123", env)
    expect(res).not.toBeNull()
    expect(res?.product).toBe("test")
    expect(res?.targetUrl).toBe("TEST_SIMULATION")
  })

  it("returns null for unknown prefix", () => {
    const res = resolveTargetUrl("unknown-123", env)
    expect(res).toBeNull()
  })

  it("returns null for empty id", () => {
    expect(resolveTargetUrl("", env)).toBeNull()
    expect(resolveTargetUrl(null, env)).toBeNull()
  })

  it("resolves dynamic product webhook url from env var", () => {
    const dynamicEnv = {
      ...env,
      DOMPIKU_WEBHOOK_URL: "https://dompiku.akordium.id/api/webhooks/xendit",
    }
    const res = resolveTargetUrl("dompiku-sub-9988", dynamicEnv)
    expect(res).not.toBeNull()
    expect(res?.product).toBe("dompiku")
    expect(res?.targetUrl).toBe("https://dompiku.akordium.id/api/webhooks/xendit")

    const resUnderscore = resolveTargetUrl("DOMPIKU_INV_1122", dynamicEnv)
    expect(resUnderscore?.product).toBe("dompiku")
    expect(resUnderscore?.targetUrl).toBe("https://dompiku.akordium.id/api/webhooks/xendit")
  })

  it("resolves routes from ROUTES_CONFIG JSON", () => {
    const jsonEnv = {
      ROUTES_CONFIG: JSON.stringify({
        layangan: "https://layangan.akordium.id/api/payment/webhook",
        pos: "https://pos.akordium.id/api/webhook",
      }),
    }
    const res = resolveTargetUrl("layangan-10029", jsonEnv)
    expect(res).not.toBeNull()
    expect(res?.product).toBe("layangan")
    expect(res?.targetUrl).toBe("https://layangan.akordium.id/api/payment/webhook")
  })

  it("gracefully ignores malformed ROUTES_CONFIG without crashing", () => {
    const malformedEnv = {
      ...env,
      ROUTES_CONFIG: "{ invalid json string",
    }
    // Should still resolve legacy/default route
    const res = resolveTargetUrl("visteo-99", malformedEnv)
    expect(res?.targetUrl).toBe("https://visteo-app.akordium.id/api/payment/webhook")

    // Unknown route returns null safely
    expect(resolveTargetUrl("random-123", malformedEnv)).toBeNull()
  })
})
