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
      categories: {
        Row: {
          color: string | null
          created_at: string
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
        Relationships: []
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
          updated_at?: string
        }
        Relationships: []
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
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
