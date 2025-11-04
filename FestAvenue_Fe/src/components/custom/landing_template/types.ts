export type ReactionType = 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry'

export interface Reaction {
  type: ReactionType
  count: number
}

export interface SocialMediaImage {
  id: string
  url: string
  caption?: string
  likes?: number
  reactions?: Reaction[]
  comments?: Comment[]
  isExisting?: boolean // Flag to identify images loaded from API vs newly added
}

export interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: Date | string
}

export interface RelatedEvent {
  id: string
  title: string
  image: string
  date: string
  location: string
  url: string
}

export interface SocialLink {
  platform: 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'tiktok' | 'youtube'
  url: string
}

export interface LandingTemplateProps {
  // Banner section
  bannerUrl: string
  title: string
  subtitle?: string
  description: string

  // Author/Event info
  authorName: string
  authorAvatar?: string
  eventDate?: string
  eventLocation?: string
  eventCode?: string

  // Content sections
  content: string
  images: SocialMediaImage[]

  // Footer sections
  relatedEvents: RelatedEvent[]
  socialLinks: SocialLink[]

  // User info
  currentUserId?: string | null

  // Actions
  onLike?: (imageId: string) => void
  onReaction?: (imageId: string, reactionType: ReactionType) => void
  onComment?: (imageId: string, comment: string) => void
  onDeleteComment?: (commentId: string, imageId: string) => void
  onUpdateComment?: (commentId: string, imageId: string, newContent: string) => void
  onImageClick?: (imageId: string, imageUrl: string, imageCaption?: string) => void // Custom handler for image click
  onShare?: () => void
  onRegister?: () => void
}
