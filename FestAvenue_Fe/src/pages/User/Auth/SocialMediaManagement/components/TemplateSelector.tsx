import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { TEMPLATE_LIST } from '../constants'
import type { TemplateType } from '../types'

interface TemplateSelectorProps {
  selectedTemplate: TemplateType | null
  onSelectTemplate: (templateId: TemplateType) => void
  onPreview: (templateId: TemplateType) => void
}

export default function TemplateSelector({ selectedTemplate, onSelectTemplate, onPreview }: TemplateSelectorProps) {
  return (
    <div className='min-h-[calc(100vh-200px)] py-8'>
      <div className='max-w-7xl mx-auto px-4'>
        {/* Header */}
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent mb-4'>
            Chọn Template Social Media
          </h1>
          <p className='text-gray-600 text-lg max-w-2xl mx-auto'>
            Chọn một template phù hợp với phong cách sự kiện của bạn. Bạn có thể xem trước và tùy chỉnh sau khi chọn.
          </p>
        </div>

        {/* Template Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {TEMPLATE_LIST.map((template) => {
            const isSelected = selectedTemplate === template.id

            return (
              <Card
                key={template.id}
                className={`group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer ${
                  isSelected ? 'ring-2 ring-cyan-400 shadow-xl' : 'hover:shadow-lg'
                }`}
                onClick={() => onSelectTemplate(template.id)}
              >
                {/* Selection Badge */}
                {isSelected && (
                  <div className='absolute top-4 right-4 z-10 bg-gradient-to-r from-cyan-400 to-blue-400 text-white rounded-full p-2 shadow-lg animate-in zoom-in duration-300'>
                    <Check className='w-5 h-5' />
                  </div>
                )}

                {/* Thumbnail */}
                <div className='relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200'>
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                </div>

                <CardHeader>
                  <CardTitle className='flex items-center justify-between'>
                    <span className='text-xl'>{template.name}</span>
                    {isSelected && (
                      <Badge className='bg-gradient-to-r from-cyan-400 to-blue-400 text-white border-0'>
                        Đã chọn
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className='text-sm line-clamp-2'>{template.description}</CardDescription>
                </CardHeader>

                <CardContent className='space-y-4'>
                  {/* Features */}
                  <div className='space-y-2'>
                    <p className='text-sm font-medium text-gray-700'>Tính năng:</p>
                    <div className='flex flex-wrap gap-2'>
                      {template.features.map((feature, index) => (
                        <Badge key={index} variant='secondary' className='text-xs'>
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex gap-2 pt-2'>
                    <Button
                      variant='outline'
                      className='flex-1 hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-300 transition-colors'
                      onClick={(e) => {
                        e.stopPropagation()
                        onPreview(template.id)
                      }}
                    >
                      Xem trước
                    </Button>
                    <Button
                      className={`flex-1 transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-500 hover:to-blue-500'
                          : 'bg-gray-600 hover:bg-gray-700'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectTemplate(template.id)
                      }}
                    >
                      {isSelected ? 'Đã chọn' : 'Chọn'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
