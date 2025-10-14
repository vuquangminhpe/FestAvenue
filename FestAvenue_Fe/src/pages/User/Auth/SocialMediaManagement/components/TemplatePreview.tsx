import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit2, ExternalLink } from 'lucide-react'
import {
  Template1,
  Template2,
  Template3,
  Template4,
  Template5,
  Template6
} from '@/components/custom/landing_template'
import type { LandingTemplateProps } from '@/components/custom/landing_template'
import type { TemplateType } from '../types'

interface TemplatePreviewProps {
  templateType: TemplateType
  templateData: LandingTemplateProps
  onBack: () => void
  onEdit: () => void
}

const templateComponents = {
  template1: Template1,
  template2: Template2,
  template3: Template3,
  template4: Template4,
  template5: Template5,
  template6: Template6
}

export default function TemplatePreview({ templateType, templateData, onBack, onEdit }: TemplatePreviewProps) {
  const TemplateComponent = templateComponents[templateType]

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Fixed Action Bar */}
      <div className='sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Button variant='ghost' onClick={onBack} className='gap-2 hover:bg-cyan-50 hover:text-cyan-600'>
                <ArrowLeft className='w-4 h-4' />
                Quay lại
              </Button>
              <div className='h-6 w-px bg-gray-300' />
              <div>
                <h2 className='text-lg font-semibold text-gray-900'>Xem trước Template</h2>
                <p className='text-sm text-gray-500'>Xem trước giao diện trước khi chỉnh sửa</p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <Button
                variant='outline'
                className='gap-2 hover:bg-gray-50'
                onClick={() => window.open(window.location.href, '_blank')}
              >
                <ExternalLink className='w-4 h-4' />
                Mở tab mới
              </Button>
              <Button
                onClick={onEdit}
                className='gap-2 bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-500 hover:to-blue-500 text-white'
              >
                <Edit2 className='w-4 h-4' />
                Chỉnh sửa
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Template Preview */}
      <div className='relative'>
        {/* Preview Label */}
        <div className='sticky top-20 z-40 flex justify-center pointer-events-none'>
          <div className='bg-gradient-to-r from-cyan-400 to-blue-400 text-white px-6 py-2 rounded-full shadow-lg text-sm font-medium'>
            Chế độ xem trước
          </div>
        </div>

        {/* Template Content */}
        <div className='mt-6'>
          <TemplateComponent {...templateData} />
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className='fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg z-50'>
        <div className='max-w-7xl mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-gray-600'>Bạn hài lòng với template này?</p>
            <div className='flex items-center gap-3'>
              <Button variant='outline' onClick={onBack}>
                Chọn template khác
              </Button>
              <Button
                onClick={onEdit}
                className='bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-500 hover:to-blue-500 text-white'
              >
                Tiếp tục chỉnh sửa
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
