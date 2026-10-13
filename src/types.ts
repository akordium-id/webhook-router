export interface Bindings {
  XENDIT_WEBHOOK_TOKEN?: string
  VISTEO_WEBHOOK_URL?: string
  CRM_WEBHOOK_URL?: string
}

export interface RouteMatch {
  product: string
  targetUrl: string
}
