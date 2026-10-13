import type { Bindings, RouteMatch } from "./types"

export function resolveTargetUrl(
  orderOrExternalId: string | undefined | null,
  env: Bindings,
): RouteMatch | null {
  if (!orderOrExternalId) return null

  const trimmed = orderOrExternalId.trim().toLowerCase()

  // Default routes table
  const defaultRoutes: Record<string, string> = {
    visteo: env.VISTEO_WEBHOOK_URL || "https://visteo-app.akordium.id/api/payment/webhook",
    crm: env.CRM_WEBHOOK_URL || "https://crm.akordium.id/api/payment/webhook",
  }

  for (const [prefix, targetUrl] of Object.entries(defaultRoutes)) {
    if (trimmed.startsWith(`${prefix}-`) || trimmed.startsWith(`${prefix}_`)) {
      return { product: prefix, targetUrl }
    }
  }

  // Jika payload simulasi / test dari dashboard Xendit (contoh: "invoice_123124123")
  if (trimmed.startsWith("invoice_123") || trimmed === "test") {
    return {
      product: "test",
      targetUrl: "TEST_SIMULATION",
    }
  }

  return null
}
