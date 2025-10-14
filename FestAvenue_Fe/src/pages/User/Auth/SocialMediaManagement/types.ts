import type { LandingTemplateProps } from '@/components/custom/landing_template'

export type TemplateType = 'template1' | 'template2' | 'template3' | 'template4' | 'template5' | 'template6'

export interface TemplateInfo {
  id: TemplateType
  name: string
  description: string
  thumbnail: string
  features: string[]
}

export interface TemplateData {
  id: string
  templateType: TemplateType
  data: LandingTemplateProps
  createdAt: string
  updatedAt: string
}

export type ViewMode = 'select' | 'preview' | 'edit'
