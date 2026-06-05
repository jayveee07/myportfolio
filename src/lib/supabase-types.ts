export interface Database {
  public: {
    Tables: {
      experiences: {
        Row: {
          id: string
          company: string
          role: string
          period: string
          description: string[] | null
          order: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          company: string
          role: string
          period: string
          description?: string[]
          order?: number
        }
        Update: {
          company?: string
          role?: string
          period?: string
          description?: string[]
          order?: number
        }
        Relationships: []
      }
      skills: {
        Row: {
          id: string
          category: string
          items: string[] | null
          order: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          category: string
          items?: string[]
          order?: number
        }
        Update: {
          category?: string
          items?: string[]
          order?: number
        }
        Relationships: []
      }
      education: {
        Row: {
          id: string
          school: string
          degree: string
          period: string
          description: string[] | null
          order: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          school: string
          degree: string
          period: string
          description?: string[]
          order?: number
        }
        Update: {
          school?: string
          degree?: string
          period?: string
          description?: string[]
          order?: number
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string
          tech_stack: string[] | null
          featured: boolean | null
          link: string | null
          github: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          tech_stack?: string[]
          featured?: boolean
          link?: string
          github?: string
        }
        Update: {
          title?: string
          description?: string
          tech_stack?: string[]
          featured?: boolean
          link?: string
          github?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          participants: string[] | null
          visitor_uid: string | null
          visitor_id: string | null
          visitor_name: string | null
          visitor_email: string | null
          visitor_avatar: string | null
          visitor_ip: string | null
          last_message: string | null
          is_auto_replied: boolean | null
          unread_count: number | null
          admin_typing: boolean | null
          visitor_typing: boolean | null
          is_pinned: boolean | null
          is_blocked: boolean | null
          is_deleted: boolean | null
          updated_at: string | null
          created_at: string | null
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          text: string
          sender_id: string
          sender_name: string | null
          sender_avatar: string | null
          sender_ip: string | null
          is_edited: boolean | null
          is_deleted: boolean | null
          deleted_by: string[] | null
          is_read: boolean | null
          created_at: string | null
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      visits: {
        Row: {
          id: string
          visitor_id: string
          email: string | null
          ip: string | null
          path: string | null
          user_agent: string | null
          timestamp: string | null
          last_active: string | null
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          auto_reply_enabled: boolean | null
          notification_sounds: boolean | null
          online_status: string | null
          resume_url: string | null
          online_hours: string | null
          built_with: string | null
          footer_heading_top: string | null
          footer_heading_accent: string | null
          footer_heading_bottom: string | null
          footer_subtitle: string | null
          footer_cta: string | null
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      users: {
        Row: {
          id: string
          uid: string | null
          email: string | null
          last_active: string | null
          created_at: string | null
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      testimonials: {
        Row: {
          id: string
          name: string
          role: string
          company: string
          text: string
          avatar: string | null
          approved: boolean | null
          created_at: string | null
        }
        Insert: {
          name: string
          role: string
          company: string
          text: string
          avatar?: string
        }
        Update: Record<string, unknown>
        Relationships: []
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          excerpt: string
          date: string
          read_time: string
          tags: string[] | null
          link: string
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          excerpt: string
          date: string
          read_time: string
          tags?: string[]
          link: string
        }
        Update: {
          title?: string
          excerpt?: string
          date?: string
          read_time?: string
          tags?: string[]
          link?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          name: string | null
          email: string | null
          bio: string | null
          location: string | null
          languages: string[] | null
          github_url: string | null
          linkedin_url: string | null
          resume_url: string | null
          photo_url: string | null
          phone: string | null
          titles: string[] | null
          professional_images: string[] | null
          sections_visible: string[] | null
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
