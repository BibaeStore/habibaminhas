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
      admin_users: {
        Row: { created_at: string; email: string; id: string; name: string; role: string; updated_at: string }
        Insert: { created_at?: string; email: string; id: string; name: string; role?: string; updated_at?: string }
        Update: { created_at?: string; email?: string; id?: string; name?: string; role?: string; updated_at?: string }
        Relationships: []
      }
      categories: {
        Row: { color: string | null; created_at: string; id: string; image: string | null; name: string; parent_id: string | null; product_count: number; seo_desc: string | null; seo_title: string | null; slug: string; sort_order: number; status: string; type: string; updated_at: string }
        Insert: { color?: string | null; created_at?: string; id?: string; image?: string | null; name: string; parent_id?: string | null; product_count?: number; seo_desc?: string | null; seo_title?: string | null; slug: string; sort_order?: number; status?: string; type?: string; updated_at?: string }
        Update: { color?: string | null; created_at?: string; id?: string; image?: string | null; name?: string; parent_id?: string | null; product_count?: number; seo_desc?: string | null; seo_title?: string | null; slug?: string; sort_order?: number; status?: string; type?: string; updated_at?: string }
        Relationships: [{ foreignKeyName: "categories_parent_id_fkey"; columns: ["parent_id"]; isOneToOne: false; referencedRelation: "categories"; referencedColumns: ["id"] }]
      }
      customers: {
        Row: { city: string | null; created_at: string; email: string; id: string; name: string; phone: string | null; tier: string; total_orders: number; total_spent: number; updated_at: string }
        Insert: { city?: string | null; created_at?: string; email: string; id: string; name?: string; phone?: string | null; tier?: string; total_orders?: number; total_spent?: number; updated_at?: string }
        Update: { city?: string | null; created_at?: string; email?: string; id?: string; name?: string; phone?: string | null; tier?: string; total_orders?: number; total_spent?: number; updated_at?: string }
        Relationships: []
      }
      order_items: {
        Row: { created_at: string; id: string; order_id: string; product_id: string | null; product_image: string | null; product_title: string; quantity: number; size: string | null; sku: string | null; total_price: number; unit_price: number }
        Insert: { created_at?: string; id?: string; order_id: string; product_id?: string | null; product_image?: string | null; product_title: string; quantity: number; size?: string | null; sku?: string | null; total_price: number; unit_price: number }
        Update: { created_at?: string; id?: string; order_id?: string; product_id?: string | null; product_image?: string | null; product_title?: string; quantity?: number; size?: string | null; sku?: string | null; total_price?: number; unit_price?: number }
        Relationships: [{ foreignKeyName: "order_items_order_id_fkey"; columns: ["order_id"]; isOneToOne: false; referencedRelation: "orders"; referencedColumns: ["id"] }, { foreignKeyName: "order_items_product_id_fkey"; columns: ["product_id"]; isOneToOne: false; referencedRelation: "products"; referencedColumns: ["id"] }]
      }
      orders: {
        Row: { address: Json; admin_note: string | null; courier: string | null; created_at: string; customer_email: string; customer_id: string | null; customer_name: string; customer_phone: string; id: string; order_number: string; payment_method: string; payment_status: string; shipping: number; status: string; subtotal: number; total: number; tracking_number: string | null; updated_at: string }
        Insert: { address?: Json; admin_note?: string | null; courier?: string | null; created_at?: string; customer_email: string; customer_id?: string | null; customer_name: string; customer_phone: string; id?: string; order_number: string; payment_method?: string; payment_status?: string; shipping?: number; status?: string; subtotal: number; total: number; tracking_number?: string | null; updated_at?: string }
        Update: { address?: Json; admin_note?: string | null; courier?: string | null; created_at?: string; customer_email?: string; customer_id?: string | null; customer_name?: string; customer_phone?: string; id?: string; order_number?: string; payment_method?: string; payment_status?: string; shipping?: number; status?: string; subtotal?: number; total?: number; tracking_number?: string | null; updated_at?: string }
        Relationships: [{ foreignKeyName: "orders_customer_id_fkey"; columns: ["customer_id"]; isOneToOne: false; referencedRelation: "customers"; referencedColumns: ["id"] }]
      }
      products: {
        Row: { badge: string | null; category: string; compare_at: number | null; created_at: string; description: string | null; featured: boolean; id: string; images: string[]; palette: string[]; price: number; seo_description: string | null; seo_keywords: string | null; seo_title: string | null; short_description: string | null; size_guide: boolean; sizes_stock: Json | null; sku: string | null; slug: string; status: string; stock: number; subcategory: string | null; subtype: string | null; title: string; updated_at: string }
        Insert: { badge?: string | null; category: string; compare_at?: number | null; created_at?: string; description?: string | null; featured?: boolean; id?: string; images?: string[]; palette?: string[]; price: number; seo_description?: string | null; seo_keywords?: string | null; seo_title?: string | null; short_description?: string | null; size_guide?: boolean; sizes_stock?: Json | null; sku?: string | null; slug: string; status?: string; stock?: number; subcategory?: string | null; subtype?: string | null; title: string; updated_at?: string }
        Update: { badge?: string | null; category?: string; compare_at?: number | null; created_at?: string; description?: string | null; featured?: boolean; id?: string; images?: string[]; palette?: string[]; price?: number; seo_description?: string | null; seo_keywords?: string | null; seo_title?: string | null; short_description?: string | null; size_guide?: boolean; sizes_stock?: Json | null; sku?: string | null; slug?: string; status?: string; stock?: number; subcategory?: string | null; subtype?: string | null; title?: string; updated_at?: string }
        Relationships: []
      }
      settings: {
        Row: { currency: string; description: string | null; id: number; logo_url: string | null; notification_settings: Json; payment_methods: Json; seo_settings: Json; shipping_rates: Json; store_city: string; store_email: string; store_name: string; store_phone: string; timezone: string; updated_at: string }
        Insert: { currency?: string; description?: string | null; id?: number; logo_url?: string | null; notification_settings?: Json; payment_methods?: Json; seo_settings?: Json; shipping_rates?: Json; store_city?: string; store_email?: string; store_name?: string; store_phone?: string; timezone?: string; updated_at?: string }
        Update: { currency?: string; description?: string | null; id?: number; logo_url?: string | null; notification_settings?: Json; payment_methods?: Json; seo_settings?: Json; shipping_rates?: Json; store_city?: string; store_email?: string; store_name?: string; store_phone?: string; timezone?: string; updated_at?: string }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { is_admin: { Args: never; Returns: boolean } }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
