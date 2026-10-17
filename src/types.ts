export interface Bindings {
  XENDIT_WEBHOOK_TOKEN?: string
  ROUTES_CONFIG?: string
  VISTEO_WEBHOOK_URL?: string
  CRM_WEBHOOK_URL?: string
  [key: string]: unknown
}

export interface RouteMatch {
  product: string
  targetUrl: string
}
