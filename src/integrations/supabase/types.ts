export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ab_test_assignments: {
        Row: {
          assigned_at: string | null
          id: string
          test_id: string | null
          user_id: string | null
          variant: string
        }
        Insert: {
          assigned_at?: string | null
          id?: string
          test_id?: string | null
          user_id?: string | null
          variant: string
        }
        Update: {
          assigned_at?: string | null
          id?: string
          test_id?: string | null
          user_id?: string | null
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_assignments_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "ab_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ab_test_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_tests: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          name: string
          start_date: string | null
          variants: Json
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          start_date?: string | null
          variants: Json
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          start_date?: string | null
          variants?: Json
        }
        Relationships: []
      }
      addresses: {
        Row: {
          address_line_1: string
          address_line_2: string | null
          city: string
          company: string | null
          country: string
          created_at: string | null
          first_name: string
          id: string
          is_default: boolean | null
          last_name: string
          phone: string | null
          postal_code: string
          state: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          address_line_1: string
          address_line_2?: string | null
          city: string
          company?: string | null
          country: string
          created_at?: string | null
          first_name: string
          id?: string
          is_default?: boolean | null
          last_name: string
          phone?: string | null
          postal_code: string
          state: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          company?: string | null
          country?: string
          created_at?: string | null
          first_name?: string
          id?: string
          is_default?: boolean | null
          last_name?: string
          phone?: string | null
          postal_code?: string
          state?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_clicks: {
        Row: {
          campaign_id: string | null
          clicked_at: string | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          clicked_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          clicked_at?: string | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "influencer_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_clicks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          page_url: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          banner_url: string | null
          created_at: string | null
          description: string | null
          id: string
          instagram_handle: string | null
          is_verified: boolean | null
          logo_url: string | null
          name: string
          slug: string
          website_url: string | null
        }
        Insert: {
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          instagram_handle?: string | null
          is_verified?: boolean | null
          logo_url?: string | null
          name: string
          slug: string
          website_url?: string | null
        }
        Update: {
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          instagram_handle?: string | null
          is_verified?: boolean | null
          logo_url?: string | null
          name?: string
          slug?: string
          website_url?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          added_at: string | null
          id: string
          product_id: string | null
          quantity: number | null
          user_id: string | null
          variant_id: string | null
        }
        Insert: {
          added_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number | null
          user_id?: string | null
          variant_id?: string | null
        }
        Update: {
          added_at?: string | null
          id?: string
          product_id?: string | null
          quantity?: number | null
          user_id?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          added_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          added_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          added_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_id: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_products: {
        Row: {
          collection_id: string
          product_id: string
          sort_order: number | null
        }
        Insert: {
          collection_id: string
          product_id: string
          sort_order?: number | null
        }
        Update: {
          collection_id?: string
          product_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "collection_products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          banner_url: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          slug: string
          sort_order: number | null
          start_date: string | null
        }
        Insert: {
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          slug: string
          sort_order?: number | null
          start_date?: string | null
        }
        Update: {
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          slug?: string
          sort_order?: number | null
          start_date?: string | null
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          minimum_order_amount: number | null
          start_date: string | null
          type: string
          usage_count: number | null
          usage_limit: number | null
          user_usage_limit: number | null
          value: number
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          minimum_order_amount?: number | null
          start_date?: string | null
          type: string
          usage_count?: number | null
          usage_limit?: number | null
          user_usage_limit?: number | null
          value: number
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          minimum_order_amount?: number | null
          start_date?: string | null
          type?: string
          usage_count?: number | null
          usage_limit?: number | null
          user_usage_limit?: number | null
          value?: number
        }
        Relationships: []
      }
      discount_usage: {
        Row: {
          discount_id: string | null
          id: string
          order_id: string | null
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          discount_id?: string | null
          id?: string
          order_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          discount_id?: string | null
          id?: string
          order_id?: string | null
          used_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discount_usage_discount_id_fkey"
            columns: ["discount_id"]
            isOneToOne: false
            referencedRelation: "discount_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_content: {
        Row: {
          content: string | null
          created_at: string | null
          end_date: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link_url: string | null
          sort_order: number | null
          start_date: string | null
          title: string
          type: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          sort_order?: number | null
          start_date?: string | null
          title: string
          type: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_url?: string | null
          sort_order?: number | null
          start_date?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      influencer_campaigns: {
        Row: {
          campaign_name: string
          commission_rate: number | null
          created_at: string | null
          description: string | null
          discount_code: string | null
          end_date: string | null
          id: string
          influencer_id: string | null
          is_active: boolean | null
          start_date: string | null
        }
        Insert: {
          campaign_name: string
          commission_rate?: number | null
          created_at?: string | null
          description?: string | null
          discount_code?: string | null
          end_date?: string | null
          id?: string
          influencer_id?: string | null
          is_active?: boolean | null
          start_date?: string | null
        }
        Update: {
          campaign_name?: string
          commission_rate?: number | null
          created_at?: string | null
          description?: string | null
          discount_code?: string | null
          end_date?: string | null
          id?: string
          influencer_id?: string | null
          is_active?: boolean | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "influencer_campaigns_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          quantity: number
          reference_id: string | null
          type: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          quantity: number
          reference_id?: string | null
          type: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          quantity?: number
          reference_id?: string | null
          type?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_subscribed: boolean | null
          name: string | null
          preferences: Json | null
          subscribed_at: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_subscribed?: boolean | null
          name?: string | null
          preferences?: Json | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_subscribed?: boolean | null
          name?: string | null
          preferences?: Json | null
          subscribed_at?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          price: number
          product_id: string | null
          product_image: string | null
          product_name: string
          quantity: number
          variant_id: string | null
          variant_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price: number
          product_id?: string | null
          product_image?: string | null
          product_name: string
          quantity: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price?: number
          product_id?: string | null
          product_image?: string | null
          product_name?: string
          quantity?: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json
          created_at: string | null
          currency: string | null
          discount_amount: number | null
          email: string
          fulfillment_status: string | null
          id: string
          notes: string | null
          order_number: string
          payment_id: string | null
          payment_method: string | null
          payment_status: string | null
          phone: string | null
          shipping_address: Json
          shipping_amount: number | null
          shipping_method: string | null
          status: string | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
          tracking_number: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          billing_address: Json
          created_at?: string | null
          currency?: string | null
          discount_amount?: number | null
          email: string
          fulfillment_status?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          phone?: string | null
          shipping_address: Json
          shipping_amount?: number | null
          shipping_method?: string | null
          status?: string | null
          subtotal: number
          tax_amount?: number | null
          total_amount: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          billing_address?: Json
          created_at?: string | null
          currency?: string | null
          discount_amount?: number | null
          email?: string
          fulfillment_status?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          phone?: string | null
          shipping_address?: Json
          shipping_amount?: number | null
          shipping_method?: string | null
          status?: string | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      product_3d_models: {
        Row: {
          created_at: string | null
          file_size: number | null
          id: string
          model_type: string | null
          model_url: string
          product_id: string | null
          thumbnail_url: string | null
        }
        Insert: {
          created_at?: string | null
          file_size?: number | null
          id?: string
          model_type?: string | null
          model_url: string
          product_id?: string | null
          thumbnail_url?: string | null
        }
        Update: {
          created_at?: string | null
          file_size?: number | null
          id?: string
          model_type?: string | null
          model_url?: string
          product_id?: string | null
          thumbnail_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_3d_models_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string | null
          id: string
          image_type: string | null
          image_url: string
          is_primary: boolean | null
          product_id: string | null
          sort_order: number | null
          variant_id: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_type?: string | null
          image_url: string
          is_primary?: boolean | null
          product_id?: string | null
          sort_order?: number | null
          variant_id?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          image_type?: string | null
          image_url?: string
          is_primary?: boolean | null
          product_id?: string | null
          sort_order?: number | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          low_stock_threshold: number | null
          price: number | null
          product_id: string | null
          size: string | null
          sku: string
          stock_quantity: number | null
          weight: number | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          low_stock_threshold?: number | null
          price?: number | null
          product_id?: string | null
          size?: string | null
          sku: string
          stock_quantity?: number | null
          weight?: number | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          low_stock_threshold?: number | null
          price?: number | null
          product_id?: string | null
          size?: string | null
          sku?: string
          stock_quantity?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          age_group: string | null
          barcode: string | null
          base_price: number
          brand_id: string | null
          care_instructions: string | null
          category_id: string | null
          color_options: string[] | null
          compare_price: number | null
          cost_price: number | null
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          dimensions: Json | null
          gender: string | null
          id: string
          is_bestseller: boolean | null
          is_exclusive: boolean | null
          is_featured: boolean | null
          is_limited_edition: boolean | null
          is_new_arrival: boolean | null
          is_pre_order: boolean | null
          like_count: number | null
          low_stock_threshold: number | null
          material: string | null
          meta_fields: Json | null
          name: string
          pre_order_date: string | null
          rating_average: number | null
          rating_count: number | null
          release_date: string | null
          season: string | null
          seo_description: string | null
          seo_title: string | null
          share_count: number | null
          short_description: string | null
          size_options: string[] | null
          sku: string | null
          slug: string
          status: string | null
          stock_quantity: number | null
          style_code: string | null
          tags: string[] | null
          trending_score: number | null
          updated_at: string | null
          view_count: number | null
          weight: number | null
        }
        Insert: {
          age_group?: string | null
          barcode?: string | null
          base_price: number
          brand_id?: string | null
          care_instructions?: string | null
          category_id?: string | null
          color_options?: string[] | null
          compare_price?: number | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          dimensions?: Json | null
          gender?: string | null
          id?: string
          is_bestseller?: boolean | null
          is_exclusive?: boolean | null
          is_featured?: boolean | null
          is_limited_edition?: boolean | null
          is_new_arrival?: boolean | null
          is_pre_order?: boolean | null
          like_count?: number | null
          low_stock_threshold?: number | null
          material?: string | null
          meta_fields?: Json | null
          name: string
          pre_order_date?: string | null
          rating_average?: number | null
          rating_count?: number | null
          release_date?: string | null
          season?: string | null
          seo_description?: string | null
          seo_title?: string | null
          share_count?: number | null
          short_description?: string | null
          size_options?: string[] | null
          sku?: string | null
          slug: string
          status?: string | null
          stock_quantity?: number | null
          style_code?: string | null
          tags?: string[] | null
          trending_score?: number | null
          updated_at?: string | null
          view_count?: number | null
          weight?: number | null
        }
        Update: {
          age_group?: string | null
          barcode?: string | null
          base_price?: number
          brand_id?: string | null
          care_instructions?: string | null
          category_id?: string | null
          color_options?: string[] | null
          compare_price?: number | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          dimensions?: Json | null
          gender?: string | null
          id?: string
          is_bestseller?: boolean | null
          is_exclusive?: boolean | null
          is_featured?: boolean | null
          is_limited_edition?: boolean | null
          is_new_arrival?: boolean | null
          is_pre_order?: boolean | null
          like_count?: number | null
          low_stock_threshold?: number | null
          material?: string | null
          meta_fields?: Json | null
          name?: string
          pre_order_date?: string | null
          rating_average?: number | null
          rating_count?: number | null
          release_date?: string | null
          season?: string | null
          seo_description?: string | null
          seo_title?: string | null
          share_count?: number | null
          short_description?: string | null
          size_options?: string[] | null
          sku?: string | null
          slug?: string
          status?: string | null
          stock_quantity?: number | null
          style_code?: string | null
          tags?: string[] | null
          trending_score?: number | null
          updated_at?: string | null
          view_count?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      push_tokens: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          platform: string
          token: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform: string
          token: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string
          token?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "push_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recently_viewed: {
        Row: {
          id: string
          product_id: string | null
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          id?: string
          product_id?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recently_viewed_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recently_viewed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      return_items: {
        Row: {
          condition: string | null
          created_at: string | null
          id: string
          order_item_id: string | null
          quantity: number
          return_id: string | null
        }
        Insert: {
          condition?: string | null
          created_at?: string | null
          id?: string
          order_item_id?: string | null
          quantity: number
          return_id?: string | null
        }
        Update: {
          condition?: string | null
          created_at?: string | null
          id?: string
          order_item_id?: string | null
          quantity?: number
          return_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "return_items_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_items_return_id_fkey"
            columns: ["return_id"]
            isOneToOne: false
            referencedRelation: "returns"
            referencedColumns: ["id"]
          },
        ]
      }
      returns: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          order_id: string | null
          reason: string
          refund_amount: number | null
          return_number: string
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          reason: string
          refund_amount?: number | null
          return_number: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          order_id?: string | null
          reason?: string
          refund_amount?: number | null
          return_number?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      review_votes: {
        Row: {
          created_at: string | null
          id: string
          is_helpful: boolean
          review_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_helpful: boolean
          review_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_helpful?: boolean
          review_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          is_verified_purchase: boolean | null
          order_id: string | null
          product_id: string | null
          rating: number
          title: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id?: string | null
          rating: number
          title?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id?: string | null
          rating?: number
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      search_history: {
        Row: {
          created_at: string | null
          id: string
          query: string
          results_count: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          query: string
          results_count?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          query?: string
          results_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      size_guides: {
        Row: {
          brand_id: string | null
          category_id: string | null
          created_at: string | null
          guide_data: Json
          id: string
        }
        Insert: {
          brand_id?: string | null
          category_id?: string | null
          created_at?: string | null
          guide_data: Json
          id?: string
        }
        Update: {
          brand_id?: string | null
          category_id?: string | null
          created_at?: string | null
          guide_data?: Json
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "size_guides_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "size_guides_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          comments_count: number | null
          content: string | null
          created_at: string | null
          id: string
          is_featured: boolean | null
          likes_count: number | null
          platform: string
          post_id: string | null
          post_url: string
          product_id: string | null
          shares_count: number | null
          user_id: string | null
        }
        Insert: {
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          likes_count?: number | null
          platform: string
          post_id?: string | null
          post_url: string
          product_id?: string | null
          shares_count?: number | null
          user_id?: string | null
        }
        Update: {
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          likes_count?: number | null
          platform?: string
          post_id?: string | null
          post_url?: string
          product_id?: string | null
          shares_count?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      store_locations: {
        Row: {
          address: Json
          created_at: string | null
          email: string | null
          hours: Json | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
        }
        Insert: {
          address: Json
          created_at?: string | null
          email?: string | null
          hours?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
        }
        Update: {
          address?: Json
          created_at?: string | null
          email?: string | null
          hours?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          attachments: string[] | null
          created_at: string | null
          id: string
          is_internal: boolean | null
          message: string
          ticket_id: string | null
          user_id: string | null
        }
        Insert: {
          attachments?: string[] | null
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message: string
          ticket_id?: string | null
          user_id?: string | null
        }
        Update: {
          attachments?: string[] | null
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message?: string
          ticket_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          created_at: string | null
          description: string
          id: string
          priority: string | null
          status: string | null
          subject: string
          ticket_number: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          description: string
          id?: string
          priority?: string | null
          status?: string | null
          subject: string
          ticket_number: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          created_at?: string | null
          description?: string
          id?: string
          priority?: string | null
          status?: string | null
          subject?: string
          ticket_number?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          created_at: string | null
          email: string
          email_notifications: boolean | null
          full_name: string | null
          gender: string | null
          id: string
          instagram_handle: string | null
          is_influencer: boolean | null
          loyalty_points: number | null
          phone: string | null
          preferred_brands: string[] | null
          push_notifications: boolean | null
          referral_code: string | null
          referred_by: string | null
          size_profile: Json | null
          street_style_type: string | null
          tier_level: string | null
          tiktok_handle: string | null
          total_spent: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string | null
          email: string
          email_notifications?: boolean | null
          full_name?: string | null
          gender?: string | null
          id: string
          instagram_handle?: string | null
          is_influencer?: boolean | null
          loyalty_points?: number | null
          phone?: string | null
          preferred_brands?: string[] | null
          push_notifications?: boolean | null
          referral_code?: string | null
          referred_by?: string | null
          size_profile?: Json | null
          street_style_type?: string | null
          tier_level?: string | null
          tiktok_handle?: string | null
          total_spent?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          created_at?: string | null
          email?: string
          email_notifications?: boolean | null
          full_name?: string | null
          gender?: string | null
          id?: string
          instagram_handle?: string | null
          is_influencer?: boolean | null
          loyalty_points?: number | null
          phone?: string | null
          preferred_brands?: string[] | null
          push_notifications?: boolean | null
          referral_code?: string | null
          referred_by?: string | null
          size_profile?: Json | null
          street_style_type?: string | null
          tier_level?: string | null
          tiktok_handle?: string | null
          total_spent?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
