export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          password_hash: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          password_hash?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          password_hash?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          subject: string
          message: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          subject: string
          message: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          subject?: string
          message?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          image: string | null
          name: string
          nav_href: string | null
          parent_id: string | null
          product_count: number
          seo_desc: string | null
          seo_title: string | null
          slug: string
          sort_order: number
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name: string
          nav_href?: string | null
          parent_id?: string | null
          product_count?: number
          seo_desc?: string | null
          seo_title?: string | null
          slug: string
          sort_order?: number
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          nav_href?: string | null
          parent_id?: string | null
          product_count?: number
          seo_desc?: string | null
          seo_title?: string | null
          slug?: string
          sort_order?: number
          status?: string
          type?: string
          updated_at?: string
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
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          read: boolean | null
          subject: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          read?: boolean | null
          subject?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          read?: boolean | null
          subject?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          auth_user_id: string | null
          city: string | null
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          tier: string
          total_orders: number
          total_spent: number
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          city?: string | null
          created_at?: string
          email: string
          id?: string
          name?: string
          phone?: string | null
          tier?: string
          total_orders?: number
          total_spent?: number
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          city?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          tier?: string
          total_orders?: number
          total_spent?: number
          updated_at?: string
        }
        Relationships: []
      }
      journal_posts: {
        Row: {
          author: string | null
          category_tag: string | null
          content: Json
          created_at: string | null
          excerpt: string | null
          hero_image: string | null
          id: string
          keywords: string | null
          meta_description: string | null
          published_at: string | null
          slug: string
          status: string | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          author?: string | null
          category_tag?: string | null
          content?: Json
          created_at?: string | null
          excerpt?: string | null
          hero_image?: string | null
          id?: string
          keywords?: string | null
          meta_description?: string | null
          published_at?: string | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          author?: string | null
          category_tag?: string | null
          content?: Json
          created_at?: string | null
          excerpt?: string | null
          hero_image?: string | null
          id?: string
          keywords?: string | null
          meta_description?: string | null
          published_at?: string | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      order_activity_log: {
        Row: {
          action_type: string
          admin_email: string | null
          created_at: string | null
          id: string
          new_value: Json | null
          old_value: Json | null
          order_id: string
        }
        Insert: {
          action_type: string
          admin_email?: string | null
          created_at?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          order_id: string
        }
        Update: {
          action_type?: string
          admin_email?: string | null
          created_at?: string | null
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_activity_log_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_image: string | null
          product_title: string
          quantity: number
          size: string | null
          sku: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_image?: string | null
          product_title: string
          quantity: number
          size?: string | null
          sku?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_image?: string | null
          product_title?: string
          quantity?: number
          size?: string | null
          sku?: string | null
          total_price?: number
          unit_price?: number
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
        ]
      }
      orders: {
        Row: {
          address: Json
          admin_note: string | null
          courier: string | null
          created_at: string
          customer_email: string
          customer_id: string | null
          customer_name: string
          customer_phone: string
          id: string
          meta_capi_delivered_at: string | null
          meta_capi_purchase_at: string | null
          order_number: string
          payment_method: string
          payment_status: string
          shipping: number
          status: string
          subtotal: number
          total: number
          tracking_number: string | null
          postex_tracking_number: string | null
          postex_status: string | null
          postex_status_history: Json | null
          postex_cod_amount: number | null
          postex_cod_settled: boolean | null
          postex_settlement_date: string | null
          postex_cpr: string | null
          postex_booked_at: string | null
          postex_synced_at: string | null
          updated_at: string
        }
        Insert: {
          address?: Json
          admin_note?: string | null
          courier?: string | null
          created_at?: string
          customer_email: string
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          meta_capi_delivered_at?: string | null
          meta_capi_purchase_at?: string | null
          order_number: string
          payment_method?: string
          payment_status?: string
          shipping?: number
          status?: string
          subtotal: number
          total: number
          tracking_number?: string | null
          postex_tracking_number?: string | null
          postex_status?: string | null
          postex_status_history?: Json | null
          postex_cod_amount?: number | null
          postex_cod_settled?: boolean | null
          postex_settlement_date?: string | null
          postex_cpr?: string | null
          postex_booked_at?: string | null
          postex_synced_at?: string | null
          updated_at?: string
        }
        Update: {
          address?: Json
          admin_note?: string | null
          courier?: string | null
          created_at?: string
          customer_email?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          meta_capi_delivered_at?: string | null
          meta_capi_purchase_at?: string | null
          order_number?: string
          payment_method?: string
          payment_status?: string
          shipping?: number
          status?: string
          subtotal?: number
          total?: number
          tracking_number?: string | null
          postex_tracking_number?: string | null
          postex_status?: string | null
          postex_status_history?: Json | null
          postex_cod_amount?: number | null
          postex_cod_settled?: boolean | null
          postex_settlement_date?: string | null
          postex_cpr?: string | null
          postex_booked_at?: string | null
          postex_synced_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          badge: string | null
          category: string
          compare_at: number | null
          created_at: string
          description: string | null
          faqs: Json | null
          featured: boolean
          id: string
          images: string[]
          palette: string[]
          price: number
          seo_description: string | null
          seo_keywords: string | null
          seo_title: string | null
          short_description: string | null
          size_guide: string | null
          sizes_stock: Json | null
          sku: string | null
          slug: string
          status: string
          stock: number
          subcategory: string[] | null
          subtype: string | null
          title: string
          tryon_enabled: boolean
          tryon_image: string | null
          updated_at: string
        }
        Insert: {
          badge?: string | null
          category: string
          compare_at?: number | null
          created_at?: string
          description?: string | null
          faqs?: Json | null
          featured?: boolean
          id?: string
          images?: string[]
          palette?: string[]
          price: number
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          short_description?: string | null
          size_guide?: string | null
          sizes_stock?: Json | null
          sku?: string | null
          slug: string
          status?: string
          stock?: number
          subcategory?: string[] | null
          subtype?: string | null
          title: string
          tryon_enabled?: boolean
          tryon_image?: string | null
          updated_at?: string
        }
        Update: {
          badge?: string | null
          category?: string
          compare_at?: number | null
          created_at?: string
          description?: string | null
          faqs?: Json | null
          featured?: boolean
          id?: string
          images?: string[]
          palette?: string[]
          price?: number
          seo_description?: string | null
          seo_keywords?: string | null
          seo_title?: string | null
          short_description?: string | null
          size_guide?: string | null
          sizes_stock?: Json | null
          sku?: string | null
          slug?: string
          status?: string
          stock?: number
          subcategory?: string[] | null
          subtype?: string | null
          title?: string
          tryon_enabled?: boolean
          tryon_image?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          currency: string
          description: string | null
          id: number
          logo_url: string | null
          notification_settings: Json
          payment_methods: Json
          seo_settings: Json
          shipping_rates: Json
          store_city: string
          store_email: string
          store_name: string
          store_phone: string
          timezone: string
          tracking_settings: Json
          updated_at: string
          virtual_try_on_settings: Json
        }
        Insert: {
          currency?: string
          description?: string | null
          id?: number
          logo_url?: string | null
          notification_settings?: Json
          payment_methods?: Json
          seo_settings?: Json
          shipping_rates?: Json
          store_city?: string
          store_email?: string
          store_name?: string
          store_phone?: string
          timezone?: string
          tracking_settings?: Json
          updated_at?: string
          virtual_try_on_settings?: Json
        }
        Update: {
          currency?: string
          description?: string | null
          id?: number
          logo_url?: string | null
          notification_settings?: Json
          payment_methods?: Json
          seo_settings?: Json
          shipping_rates?: Json
          store_city?: string
          store_email?: string
          store_name?: string
          store_phone?: string
          timezone?: string
          tracking_settings?: Json
          updated_at?: string
          virtual_try_on_settings?: Json
        }
        Relationships: []
      }
      social_accounts: {
        Row: {
          account_label: string
          created_at: string
          credentials: Json
          enabled: boolean
          external_id: string
          id: string
          meta: Json
          platform: string
          updated_at: string
        }
        Insert: {
          account_label: string
          created_at?: string
          credentials?: Json
          enabled?: boolean
          external_id: string
          id?: string
          meta?: Json
          platform: string
          updated_at?: string
        }
        Update: {
          account_label?: string
          created_at?: string
          credentials?: Json
          enabled?: boolean
          external_id?: string
          id?: string
          meta?: Json
          platform?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_collaborators: {
        Row: {
          created_at: string
          display_name: string | null
          enabled: boolean
          id: string
          notes: string | null
          platform: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          enabled?: boolean
          id?: string
          notes?: string | null
          platform?: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          enabled?: boolean
          id?: string
          notes?: string | null
          platform?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      social_platforms: {
        Row: {
          created_at: string
          description: string
          handle: string | null
          key: string
          name: string
          photo_enabled: boolean
          profile_url: string | null
          sort_order: number
          supports_photo: boolean
          supports_video: boolean
          updated_at: string
          video_enabled: boolean
        }
        Insert: {
          created_at?: string
          description: string
          handle?: string | null
          key: string
          name: string
          photo_enabled?: boolean
          profile_url?: string | null
          sort_order?: number
          supports_photo?: boolean
          supports_video?: boolean
          updated_at?: string
          video_enabled?: boolean
        }
        Update: {
          created_at?: string
          description?: string
          handle?: string | null
          key?: string
          name?: string
          photo_enabled?: boolean
          profile_url?: string | null
          sort_order?: number
          supports_photo?: boolean
          supports_video?: boolean
          updated_at?: string
          video_enabled?: boolean
        }
        Relationships: []
      }
      social_dua_library: {
        Row: {
          arabic: string | null
          category: string
          created_at: string
          enabled: boolean
          id: string
          meaning: string
          reference: string | null
          title: string
          transliteration: string | null
        }
        Insert: {
          arabic?: string | null
          category: string
          created_at?: string
          enabled?: boolean
          id?: string
          meaning: string
          reference?: string | null
          title: string
          transliteration?: string | null
        }
        Update: {
          arabic?: string | null
          category?: string
          created_at?: string
          enabled?: boolean
          id?: string
          meaning?: string
          reference?: string | null
          title?: string
          transliteration?: string | null
        }
        Relationships: []
      }
      social_generation_log: {
        Row: {
          angle: string | null
          art_direction: string | null
          audio_mood: string | null
          camera_signature: string | null
          caption_hash: string | null
          cost_cents: number | null
          created_at: string
          error: string | null
          faq_topic: string | null
          hook: string | null
          id: string
          input_tokens: number | null
          model: string | null
          ok: boolean
          output_tokens: number | null
          product_id: string | null
          product_slug: string | null
          stream: string
        }
        Insert: {
          angle?: string | null
          art_direction?: string | null
          audio_mood?: string | null
          camera_signature?: string | null
          caption_hash?: string | null
          cost_cents?: number | null
          created_at?: string
          error?: string | null
          faq_topic?: string | null
          hook?: string | null
          id?: string
          input_tokens?: number | null
          model?: string | null
          ok?: boolean
          output_tokens?: number | null
          product_id?: string | null
          product_slug?: string | null
          stream: string
        }
        Update: {
          angle?: string | null
          art_direction?: string | null
          audio_mood?: string | null
          camera_signature?: string | null
          caption_hash?: string | null
          cost_cents?: number | null
          created_at?: string
          error?: string | null
          faq_topic?: string | null
          hook?: string | null
          id?: string
          input_tokens?: number | null
          model?: string | null
          ok?: boolean
          output_tokens?: number | null
          product_id?: string | null
          product_slug?: string | null
          stream?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_generation_log_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      social_media_queue: {
        Row: {
          archived_at: string | null
          approved_at: string | null
          audio_track: string | null
          caption: string | null
          created_at: string
          duration_seconds: number | null
          error: Json | null
          error_message: string | null
          external_post_id: string | null
          group_id: string | null
          hashtags: string[] | null
          id: string
          kind: string
          permalink: string | null
          platform: string
          platform_results: Json | null
          posted_at: string | null
          product_ids: string[]
          rebuild_note: string | null
          rebuild_requested: boolean
          status: string
          thumbnail_url: string | null
          video_url: string | null
        }
        Insert: {
          archived_at?: string | null
          approved_at?: string | null
          audio_track?: string | null
          caption?: string | null
          created_at?: string
          duration_seconds?: number | null
          error?: Json | null
          error_message?: string | null
          external_post_id?: string | null
          group_id?: string | null
          hashtags?: string[] | null
          id?: string
          kind: string
          permalink?: string | null
          platform?: string
          platform_results?: Json | null
          posted_at?: string | null
          product_ids?: string[]
          rebuild_note?: string | null
          rebuild_requested?: boolean
          status?: string
          thumbnail_url?: string | null
          video_url?: string | null
        }
        Update: {
          archived_at?: string | null
          approved_at?: string | null
          audio_track?: string | null
          caption?: string | null
          created_at?: string
          duration_seconds?: number | null
          error?: Json | null
          error_message?: string | null
          external_post_id?: string | null
          group_id?: string | null
          hashtags?: string[] | null
          id?: string
          kind?: string
          permalink?: string | null
          platform?: string
          platform_results?: Json | null
          posted_at?: string | null
          product_ids?: string[]
          rebuild_note?: string | null
          rebuild_requested?: boolean
          status?: string
          thumbnail_url?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      social_plans: {
        Row: {
          active_from: string | null
          active_to: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          notes: string | null
          photo_days: number[]
          photo_times: string[]
          photo_window_end: string | null
          photo_window_start: string | null
          photo_window_step_minutes: number
          photos_per_week: number
          reel_days: number[]
          reel_times: string[]
          reel_window_end: string | null
          reel_window_start: string | null
          reel_window_step_minutes: number
          reels_per_week: number
          static_days: number[]
          static_times: string[]
          static_window_end: string | null
          static_window_start: string | null
          static_window_step_minutes: number
          statics_per_week: number
          updated_at: string
        }
        Insert: {
          active_from?: string | null
          active_to?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          photo_days?: number[]
          photo_times?: string[]
          photo_window_end?: string | null
          photo_window_start?: string | null
          photo_window_step_minutes?: number
          photos_per_week?: number
          reel_days?: number[]
          reel_times?: string[]
          reel_window_end?: string | null
          reel_window_start?: string | null
          reel_window_step_minutes?: number
          reels_per_week?: number
          static_days?: number[]
          static_times?: string[]
          static_window_end?: string | null
          static_window_start?: string | null
          static_window_step_minutes?: number
          statics_per_week?: number
          updated_at?: string
        }
        Update: {
          active_from?: string | null
          active_to?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          photo_days?: number[]
          photo_times?: string[]
          photo_window_end?: string | null
          photo_window_start?: string | null
          photo_window_step_minutes?: number
          photos_per_week?: number
          reel_days?: number[]
          reel_times?: string[]
          reel_window_end?: string | null
          reel_window_start?: string | null
          reel_window_step_minutes?: number
          reels_per_week?: number
          static_days?: number[]
          static_times?: string[]
          static_window_end?: string | null
          static_window_start?: string | null
          static_window_step_minutes?: number
          statics_per_week?: number
          updated_at?: string
        }
        Relationships: []
      }
      social_reel_queue_order: {
        Row: {
          position: number
          product_id: string
          updated_at: string
        }
        Insert: {
          position: number
          product_id: string
          updated_at?: string
        }
        Update: {
          position?: number
          product_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_queue_order: {
        Row: {
          position: number
          product_id: string
          updated_at: string
        }
        Insert: {
          position: number
          product_id: string
          updated_at?: string
        }
        Update: {
          position?: number
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_queue_order_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      social_post_log: {
        Row: {
          alt_text: string | null
          caption: string | null
          archived_at: string | null
          created_at: string
          deleted_from: string[]
          error: Json | null
          error_message: string | null
          external_post_id: string | null
          group_id: string
          hashtags: string[] | null
          id: string
          image_urls: string[] | null
          permalink: string | null
          pin_link: string | null
          pin_title: string | null
          platform: string
          posted_at: string | null
          product_id: string | null
          product_slug: string | null
          product_title: string | null
          rotation_cycle: number
          slot: string | null
          status: string
          stream: string
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          archived_at?: string | null
          created_at?: string
          deleted_from?: string[]
          error?: Json | null
          error_message?: string | null
          external_post_id?: string | null
          group_id?: string
          hashtags?: string[] | null
          id?: string
          image_urls?: string[] | null
          permalink?: string | null
          pin_link?: string | null
          pin_title?: string | null
          platform: string
          posted_at?: string | null
          product_id?: string | null
          product_slug?: string | null
          product_title?: string | null
          rotation_cycle?: number
          slot?: string | null
          status: string
          stream?: string
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          archived_at?: string | null
          created_at?: string
          deleted_from?: string[]
          error?: Json | null
          error_message?: string | null
          external_post_id?: string | null
          group_id?: string
          hashtags?: string[] | null
          id?: string
          image_urls?: string[] | null
          permalink?: string | null
          pin_link?: string | null
          pin_title?: string | null
          platform?: string
          posted_at?: string | null
          product_id?: string | null
          product_slug?: string | null
          product_title?: string | null
          rotation_cycle?: number
          slot?: string | null
          status?: string
          stream?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_post_log_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      social_static_order: {
        Row: {
          position: number
          product_id: string
          updated_at: string
        }
        Insert: {
          position: number
          product_id: string
          updated_at?: string
        }
        Update: {
          position?: number
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_static_order_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      social_settings: {
        Row: {
          ai_captions_enabled: boolean
          approval_required: boolean
          caption_include_price: boolean
          categories: string[]
          enabled: boolean
          id: number
          max_posts_per_day: number
          min_images: number
          period: string
          platforms: string[]
          post_days: number[]
          posts_per_period: number
          products_per_post: number
          reel_days: number[]
          reel_times: string[]
          reel_window_end: string | null
          reel_window_start: string | null
          reel_window_step_minutes: number
          require_in_stock: boolean
          slot_times: string[]
          slot_window_end: string | null
          slot_window_start: string | null
          slot_window_step_minutes: number
          static_days: number[]
          static_times: string[]
          static_window_end: string | null
          static_window_start: string | null
          static_window_step_minutes: number
          timezone: string
          updated_at: string
        }
        Insert: {
          ai_captions_enabled?: boolean
          approval_required?: boolean
          caption_include_price?: boolean
          categories?: string[]
          enabled?: boolean
          id?: number
          max_posts_per_day?: number
          min_images?: number
          period?: string
          platforms?: string[]
          post_days?: number[]
          posts_per_period?: number
          products_per_post?: number
          reel_days?: number[]
          reel_times?: string[]
          reel_window_end?: string | null
          reel_window_start?: string | null
          reel_window_step_minutes?: number
          require_in_stock?: boolean
          slot_times?: string[]
          slot_window_end?: string | null
          slot_window_start?: string | null
          slot_window_step_minutes?: number
          static_days?: number[]
          static_times?: string[]
          static_window_end?: string | null
          static_window_start?: string | null
          static_window_step_minutes?: number
          timezone?: string
          updated_at?: string
        }
        Update: {
          ai_captions_enabled?: boolean
          approval_required?: boolean
          caption_include_price?: boolean
          categories?: string[]
          enabled?: boolean
          id?: number
          max_posts_per_day?: number
          min_images?: number
          period?: string
          platforms?: string[]
          post_days?: number[]
          posts_per_period?: number
          products_per_post?: number
          reel_days?: number[]
          reel_times?: string[]
          reel_window_end?: string | null
          reel_window_start?: string | null
          reel_window_step_minutes?: number
          require_in_stock?: boolean
          slot_times?: string[]
          slot_window_end?: string | null
          slot_window_start?: string | null
          slot_window_step_minutes?: number
          static_days?: number[]
          static_times?: string[]
          static_window_end?: string | null
          static_window_start?: string | null
          static_window_step_minutes?: number
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_product_stock: {
        Args: { p_items: Json; p_threshold?: number }
        Returns: {
          crossed_threshold: boolean
          id: string
          stock: number
          title: string
        }[]
      }
      is_admin: { Args: never; Returns: boolean }
      set_admin_password: {
        Args: { p_email: string; p_password: string }
        Returns: undefined
      }
      verify_admin_login: {
        Args: { p_email: string; p_password: string }
        Returns: {
          email: string
          id: string
          name: string
          role: string
        }[]
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
