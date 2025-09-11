export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      analytics_events: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          event_type: string
          event_data: Json
          page_url: string | null
          referrer: string | null
          user_agent: string | null
          ip_address: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          event_type: string
          event_data?: Json
          page_url?: string | null
          referrer?: string | null
          user_agent?: string | null
          ip_address?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          event_type?: string
          event_data?: Json
          page_url?: string | null
          referrer?: string | null
          user_agent?: string | null
          ip_address?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          type: string | null
          first_name: string
          last_name: string
          company: string | null
          address_line_1: string
          address_line_2: string | null
          city: string
          state: string
          postal_code: string
          country: string
          phone: string | null
          is_default: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type?: string | null
          first_name: string
          last_name: string
          company?: string | null
          address_line_1: string
          address_line_2?: string | null
          city: string
          state: string
          postal_code: string
          country: string
          phone?: string | null
          is_default?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string | null
          first_name?: string
          last_name?: string
          company?: string | null
          address_line_1?: string
          address_line_2?: string | null
          city?: string
          state?: string
          postal_code?: string
          country?: string
          phone?: string | null
          is_default?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      brands: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          website_url: string | null
          is_verified: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          website_url?: string | null
          is_verified?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          website_url?: string | null
          is_verified?: boolean | null
          created_at?: string | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          variant_id: string | null
          quantity: number
          price_at_time: number
          added_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          variant_id?: string | null
          quantity?: number
          price_at_time: number
          added_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          variant_id?: string | null
          quantity?: number
          price_at_time?: number
          added_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          }
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          sort_order: number | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      inventory_transactions: {
        Row: {
          id: string
          product_id: string
          variant_id: string | null
          transaction_type: string
          quantity_change: number
          previous_stock: number
          new_stock: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
          user_id: string | null
          created_at: string | null
          metadata: Json
        }
        Insert: {
          id?: string
          product_id: string
          variant_id?: string | null
          transaction_type: string
          quantity_change: number
          previous_stock: number
          new_stock: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string | null
          created_at?: string | null
          metadata?: Json
        }
        Update: {
          id?: string
          product_id?: string
          variant_id?: string | null
          transaction_type?: string
          quantity_change?: number
          previous_stock?: number
          new_stock?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string | null
          created_at?: string | null
          metadata?: Json
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Json
          is_read: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: Json
          is_read?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: Json
          is_read?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          id: string
          user_id: string
          order_number: string
          status: string | null
          payment_status: string | null
          total_amount: number
          subtotal: number
          tax_amount: number | null
          shipping_amount: number | null
          discount_amount: number | null
          currency: string | null
          shipping_address: Json | null
          billing_address: Json | null
          payment_method: string | null
          payment_id: string | null
          tracking_number: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          order_number: string
          status?: string | null
          payment_status?: string | null
          total_amount: number
          subtotal: number
          tax_amount?: number | null
          shipping_amount?: number | null
          discount_amount?: number | null
          currency?: string | null
          shipping_address?: Json | null
          billing_address?: Json | null
          payment_method?: string | null
          payment_id?: string | null
          tracking_number?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          order_number?: string
          status?: string | null
          payment_status?: string | null
          total_amount?: number
          subtotal?: number
          tax_amount?: number | null
          shipping_amount?: number | null
          discount_amount?: number | null
          currency?: string | null
          shipping_address?: Json | null
          billing_address?: Json | null
          payment_method?: string | null
          payment_id?: string | null
          tracking_number?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          variant_id: string | null
          quantity: number
          unit_price: number
          total_price: number
          product_name: string
          variant_name: string | null
          product_image: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          variant_id?: string | null
          quantity: number
          unit_price: number
          total_price: number
          product_name: string
          variant_name?: string | null
          product_image?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          variant_id?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
          product_name?: string
          variant_name?: string | null
          product_image?: string | null
          created_at?: string | null
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
          }
        ]
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string | null
          description: string | null
          base_price: number
          compare_price: number | null
          cost_price: number | null
          sku: string | null
          barcode: string | null
          brand_id: string | null
          category_id: string | null
          status: string | null
          is_featured: boolean | null
          is_limited_edition: boolean | null
          is_new: boolean | null
          is_bestseller: boolean | null
          is_new_arrival: boolean | null
          weight: number | null
          dimensions: Json | null
          material: string | null
          care_instructions: string | null
          tags: string[] | null
          color_options: string[] | null
          size_options: string[] | null
          images: string[] | null
          image_url: string | null
          rating_average: number | null
          rating_count: number | null
          view_count: number | null
          stock_quantity: number | null
          low_stock_threshold: number | null
          track_quantity: boolean | null
          allow_backorder: boolean | null
          metadata: Json
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          name: string
          slug?: string | null
          description?: string | null
          base_price: number
          compare_price?: number | null
          cost_price?: number | null
          sku?: string | null
          barcode?: string | null
          brand_id?: string | null
          category_id?: string | null
          status?: string | null
          is_featured?: boolean | null
          is_limited_edition?: boolean | null
          is_new?: boolean | null
          is_bestseller?: boolean | null
          is_new_arrival?: boolean | null
          weight?: number | null
          dimensions?: Json | null
          material?: string | null
          care_instructions?: string | null
          tags?: string[] | null
          color_options?: string[] | null
          size_options?: string[] | null
          images?: string[] | null
          image_url?: string | null
          rating_average?: number | null
          rating_count?: number | null
          view_count?: number | null
          stock_quantity?: number | null
          low_stock_threshold?: number | null
          track_quantity?: boolean | null
          allow_backorder?: boolean | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string | null
          description?: string | null
          base_price?: number
          compare_price?: number | null
          cost_price?: number | null
          sku?: string | null
          barcode?: string | null
          brand_id?: string | null
          category_id?: string | null
          status?: string | null
          is_featured?: boolean | null
          is_limited_edition?: boolean | null
          is_new?: boolean | null
          is_bestseller?: boolean | null
          is_new_arrival?: boolean | null
          weight?: number | null
          dimensions?: Json | null
          material?: string | null
          care_instructions?: string | null
          tags?: string[] | null
          color_options?: string[] | null
          size_options?: string[] | null
          images?: string[] | null
          image_url?: string | null
          rating_average?: number | null
          rating_count?: number | null
          view_count?: number | null
          stock_quantity?: number | null
          low_stock_threshold?: number | null
          track_quantity?: boolean | null
          allow_backorder?: boolean | null
          metadata?: Json
          created_at?: string | null
          updated_at?: string | null
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
          }
        ]
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          variant_id: string | null
          image_url: string
          alt_text: string | null
          is_primary: boolean | null
          sort_order: number | null
          image_type: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          product_id: string
          variant_id?: string | null
          image_url: string
          alt_text?: string | null
          is_primary?: boolean | null
          sort_order?: number | null
          image_type?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          variant_id?: string | null
          image_url?: string
          alt_text?: string | null
          is_primary?: boolean | null
          sort_order?: number | null
          image_type?: string | null
          created_at?: string | null
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
          }
        ]
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          sku: string | null
          color: string | null
          size: string | null
          price: number | null
          compare_price: number | null
          stock_quantity: number | null
          is_active: boolean | null
          weight: number | null
          dimensions: Json | null
          barcode: string | null
          position: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          product_id: string
          sku?: string | null
          color?: string | null
          size?: string | null
          price?: number | null
          compare_price?: number | null
          stock_quantity?: number | null
          is_active?: boolean | null
          weight?: number | null
          dimensions?: Json | null
          barcode?: string | null
          position?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          product_id?: string
          sku?: string | null
          color?: string | null
          size?: string | null
          price?: number | null
          compare_price?: number | null
          stock_quantity?: number | null
          is_active?: boolean | null
          weight?: number | null
          dimensions?: Json | null
          barcode?: string | null
          position?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      recently_viewed: {
        Row: {
          id: string
          user_id: string | null
          product_id: string
          viewed_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          product_id: string
          viewed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          product_id?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recently_viewed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recently_viewed_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews: {
        Row: {
          id: string
          user_id: string
          product_id: string
          order_id: string | null
          rating: number
          title: string | null
          comment: string | null
          images: string[] | null
          is_verified_purchase: boolean | null
          is_featured: boolean | null
          helpful_count: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          order_id?: string | null
          rating: number
          title?: string | null
          comment?: string | null
          images?: string[] | null
          is_verified_purchase?: boolean | null
          is_featured?: boolean | null
          helpful_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          order_id?: string | null
          rating?: number
          title?: string | null
          comment?: string | null
          images?: string[] | null
          is_verified_purchase?: boolean | null
          is_featured?: boolean | null
          helpful_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
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
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      review_votes: {
        Row: {
          id: string
          review_id: string
          user_id: string
          is_helpful: boolean
          created_at: string | null
        }
        Insert: {
          id?: string
          review_id: string
          user_id: string
          is_helpful: boolean
          created_at?: string | null
        }
        Update: {
          id?: string
          review_id?: string
          user_id?: string
          is_helpful?: boolean
          created_at?: string | null
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
          }
        ]
      }
      search_history: {
        Row: {
          id: string
          user_id: string | null
          query: string
          results_count: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          query: string
          results_count?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          query?: string
          results_count?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "search_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      stock_reservations: {
        Row: {
          id: string
          user_id: string
          product_id: string
          variant_id: string | null
          quantity: number
          expires_at: string
          status: string | null
          order_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          variant_id?: string | null
          quantity: number
          expires_at: string
          status?: string | null
          order_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          variant_id?: string | null
          quantity?: number
          expires_at?: string
          status?: string | null
          order_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_reservations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reservations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reservations_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reservations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          full_name: string | null
          username: string | null
          phone: string | null
          date_of_birth: string | null
          gender: string | null
          avatar_url: string | null
          is_verified: boolean | null
          preferences: Json
          loyalty_points: number | null
          total_spent: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          username?: string | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          avatar_url?: string | null
          is_verified?: boolean | null
          preferences?: Json
          loyalty_points?: number | null
          total_spent?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          full_name?: string | null
          username?: string | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: string | null
          avatar_url?: string | null
          is_verified?: boolean | null
          preferences?: Json
          loyalty_points?: number | null
          total_spent?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string | null
          session_id: string
          is_online: boolean | null
          last_activity: string | null
          current_page: string | null
          user_agent: string | null
          ip_address: string | null
          login_time: string | null
          logout_time: string | null
          session_duration: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id: string
          is_online?: boolean | null
          last_activity?: string | null
          current_page?: string | null
          user_agent?: string | null
          ip_address?: string | null
          login_time?: string | null
          logout_time?: string | null
          session_duration?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string
          is_online?: boolean | null
          last_activity?: string | null
          current_page?: string | null
          user_agent?: string | null
          ip_address?: string | null
          login_time?: string | null
          logout_time?: string | null
          session_duration?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      wishlist_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          variant_id: string | null
          added_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          variant_id?: string | null
          added_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          variant_id?: string | null
          added_at?: string | null
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
          {
            foreignKeyName: "wishlist_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
