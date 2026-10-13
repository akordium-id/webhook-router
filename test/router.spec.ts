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
})
