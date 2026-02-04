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
        Row: {
          created_at: string | null
          email: string
          id: string
          role: Database["public"]["Enums"]["admin_role"] | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          role?: Database["public"]["Enums"]["admin_role"] | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          role?: Database["public"]["Enums"]["admin_role"] | null
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          display_order: number
          image_url: string | null
          is_active: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          display_order?: number
          image_url?: string | null
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          display_order?: number
          image_url?: string | null
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_avatar: string | null
          author_name: string | null
          author_role: string | null
          category: string | null
          content: string
          cover_image: string | null
          created_at: string | null
          excerpt: string | null
          featured: boolean | null
          featured_products: string[] | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          read_time: number | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_avatar?: string | null
          author_name?: string | null
          author_role?: string | null
          category?: string | null
          content: string
          cover_image?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          featured_products?: string[] | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_time?: number | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_avatar?: string | null
          author_name?: string | null
          author_role?: string | null
          category?: string | null
          content?: string
          cover_image?: string | null
          created_at?: string | null
          excerpt?: string | null
          featured?: boolean | null
          featured_products?: string[] | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_time?: number | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          brand: string | null
          category: Database["public"]["Enums"]["product_category"]
          created_at: string | null
          description: string
          gender: Database["public"]["Enums"]["product_gender"] | null
          id: string
          image: string
          images: string[]
          in_stock: boolean | null
          name: string
          price: number
          product_type: Database["public"]["Enums"]["product_type"]
          sale_price: number | null
          size: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          brand?: string | null
          category: Database["public"]["Enums"]["product_category"]
          created_at?: string | null
          description: string
          gender?: Database["public"]["Enums"]["product_gender"] | null
          id?: string
          image: string
          images?: string[]
          in_stock?: boolean | null
          name: string
          price: number
          product_type: Database["public"]["Enums"]["product_type"]
          sale_price?: number | null
          size: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          brand?: string | null
          category?: Database["public"]["Enums"]["product_category"]
          created_at?: string | null
          description?: string
          gender?: Database["public"]["Enums"]["product_gender"] | null
          id?: string
          image?: string
          images?: string[]
          in_stock?: boolean | null
          name?: string
          price?: number
          product_type?: Database["public"]["Enums"]["product_type"]
          sale_price?: number | null
          size?: string
          tags?: string[] | null
          updated_at?: string | null
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
      admin_role: "admin" | "super_admin"
      product_category:
        | "men"
        | "women"
        | "niche"
        | "essence-oil"
        | "body-lotion"
      product_gender: "men" | "women" | "unisex"
      product_type: "perfume" | "essence-oil" | "body-lotion"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience type aliases
export type Product = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];
export type AdminUser = Database['public']['Tables']['admin_users']['Row'];

export type ProductCategory = Database['public']['Enums']['product_category'];
export type ProductType = Database['public']['Enums']['product_type'];
export type ProductGender = Database['public']['Enums']['product_gender'];

export type ProductCategoryRow = Database['public']['Tables']['product_categories']['Row'];
export type ProductCategoryInsert = Database['public']['Tables']['product_categories']['Insert'];
export type ProductCategoryUpdate = Database['public']['Tables']['product_categories']['Update'];
