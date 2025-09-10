/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly SERVICE_ROLE_SECRET: string
  readonly STRIPE_PUBLISHABLE_KEY: string
  readonly STRIPE_SECRET_KEY: string
  readonly STRIPE_WEBHOOK_SECRET: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_GA_TRACKING_ID: string
  readonly VITE_ENABLE_3D_VIEWER: string
  readonly VITE_ENABLE_RECOMMENDATIONS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
