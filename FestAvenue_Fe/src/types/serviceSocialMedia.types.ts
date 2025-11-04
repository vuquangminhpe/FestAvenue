import type { Pagination } from './userManagement.types'

// --- Interface con ---
interface ImageInPost {
  imageInPostId?: string // Optional for create, required for update
  url: string
  caption: string
}

interface SocialLink {
  platform: number
  url: string
}

// --- Interface chính ---
export interface BodySocialPost {
  title: string
  templateNumber: number
  subtitle: string
  description: string
  bannerUrl: string
  statusPostSocialMedia: number
  body: string
  imageInPosts: ImageInPost[]
  videoUrl: string
  audioUrl: string
  eventCode: string
  authorId: string
  authorName: string
  authorAvatar: string
  publishDate: string // ISO datetime string
  expiryDate: string // ISO datetime string
  socialLinks: SocialLink[]
}
// --- Các interface con ---

export interface Reaction {
  userId: string
  fullName: string
  reactedAt: string // ISO datetime string
}

export interface UserCommentPost {
  commentId: string
  userId: string
  fullName: string
  avatar: string
  commentText: string
  commentedAt: string // ISO datetime string
}

export interface ImageInPostRes {
  imageInPostId: string
  url: string
  caption: string
  reactions: Reaction[]
  userCommentPosts: UserCommentPost[]
}

export interface SocialLinkRes {
  platform: number
  url: string
}

// --- Interface chính ---

export interface SocialPostRes {
  id: string
  createdAt: string // ISO datetime string
  updatedAt: string // ISO datetime string
  title: string
  subtitle: string
  description: string
  bannerUrl: string
  status: number
  body: string
  images: ImageInPostRes[]
  videoUrl: string
  audioUrl: string
  eventCode: string
  authorId: string
  authorName: string
  authorAvatar: string
  publishDate: string // ISO datetime string
  expiryDate: string // ISO datetime string
  socialLinks: SocialLinkRes[]
  socialMediaViewsCount: number
  templateNumber: number
}
export interface top5latestRes {
  postSocialMediaId: string
  authorName: string
  avatarAthorUrl: string
  bannerPostUrl: string
  title: string
  subtitle: string
  description: string
  body: string
  createAt: string
  publishDate: string
  totalReactions: number
  totalComments: number
  templateNumber: number
}
export interface queryReactionImagePost {
  postId: string
  imageInPostId: string
}
export interface bodyCommentInPost {
  postSocialMediaId: string
  imageInPostId: string
  commentText: string
}
export interface bodyDeleteCommentInPost {
  postSocialMediaId: string
  imageInPostId: string
  commentPostId: string
}
export interface bodyUpdateCommentInImagePost {
  postSocialMediaId: string
  imageInPostId: string
  commentPostId: string
  newContent: string
}
export interface bodyListPostSocialMedia {
  eventCode: string
  searchSocialPost?: string
  fromDate?: string
  toDate?: string
  pagination: {
    orderBy?: string
    pageIndex?: number
    isPaging: boolean
    pageSize: number //mặc định để 10
  }
}
export interface resListPostSocialMedia {
  result: resListPostSocialMediaResult[]
  pagination: Pagination
}

export interface resListPostSocialMediaResult {
  postSocialMediaId: string
  authorName: string
  avatarAthorUrl: string
  bannerPostUrl: string
  title: string
  subtitle: string
  description: string
  body: string
  createAt: string
  publishDate: string
  totalReactions: number
  totalComments: number
  templateNumber: number
}
export interface getReactionAndCommentInPostSocialMediaDetails {
  postSocialMediaId: string
  imageInPostId: string
  pagination: {
    pageIndex: number
    isPaging: true
    pageSize: number
  }
}
export interface resReactionAndCommentInPostSocialMediaDetails {
  reactions: Reaction[]
  totalReactions: number
  pagingComments: result[]
  pagination: Pagination
}
interface result {
  commentId: string
  userId: string
  fullName: string
  avatar: string
  commentText: string
  commentedAt: string
}
