import type { Bindings, RouteMatch } from "./types"

export function resolveTargetUrl(
  orderOrExternalId: string | undefined | null,
  env: Bindings,
): RouteMatch | null {
  if (!orderOrExternalId) return null

  const trimmed = orderOrExternalId.trim().toLowerCase()

  // 1. Jika payload simulasi / test dari dashboard Xendit (contoh: "invoice_123124123")
  if (trimmed.startsWith("invoice_123") || trimmed === "test") {
    return {
      product: "test",
      targetUrl: "TEST_SIMULATION",
    }
  }

  // 2. Ekstrak prefix dari external_id / order_id (delimiter '-' atau '_')
  const delimiterMatch = trimmed.match(/^([a-z0-9]+)[-_]/)
  const prefix = delimiterMatch ? delimiterMatch[1] : null

  if (prefix) {
    // 2a. Dynamic Env Var: [PREFIX]_WEBHOOK_URL (contoh: DOMPIKU_WEBHOOK_URL)
    const envKey = `${prefix.toUpperCase()}_WEBHOOK_URL`
    const dynamicUrl = env[envKey]
    if (typeof dynamicUrl === "string" && dynamicUrl.trim().length > 0) {
      return { product: prefix, targetUrl: dynamicUrl.trim() }
    }

    // 2b. Dynamic ROUTES_CONFIG JSON: {"dompiku": "https://..."}
    if (env.ROUTES_CONFIG) {
      try {
        const routesConfig = JSON.parse(env.ROUTES_CONFIG) as Record<string, unknown>
        const configuredUrl = routesConfig[prefix]
        if (typeof configuredUrl === "string" && configuredUrl.trim().length > 0) {
          return { product: prefix, targetUrl: configuredUrl.trim() }
        }
      } catch {
        // Abaikan parse error agar router tetap berjalan
      }
    }
  }

  // 3. Fallback / Default routes table (backward compatibility)
  const defaultRoutes: Record<string, string> = {
    visteo: env.VISTEO_WEBHOOK_URL || "https://visteo-app.akordium.id/api/payment/webhook",
    crm: env.CRM_WEBHOOK_URL || "https://crm.akordium.id/api/payment/webhook",
  }

  for (const [defaultPrefix, targetUrl] of Object.entries(defaultRoutes)) {
    if (trimmed.startsWith(`${defaultPrefix}-`) || trimmed.startsWith(`${defaultPrefix}_`)) {
      return { product: defaultPrefix, targetUrl }
    }
  }

  return null
}
