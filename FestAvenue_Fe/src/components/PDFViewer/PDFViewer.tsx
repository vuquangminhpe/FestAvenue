import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Button } from '@/components/ui/button'
import { Loader2, AlertCircle } from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

// Setup PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PDFViewerProps {
  url: string
  className?: string
}

export default function PDFViewer({ url, className = '' }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0)
  const [, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoading(false)
    setError('')
  }

  const onDocumentLoadError = (error: Error) => {
    setLoading(false)
    setError('Không thể tải PDF. Vui lòng thử lại.')
    console.error('PDF load error:', error)
  }

  if (error) {
    return (
      <div className='flex flex-col items-center justify-center h-full gap-4'>
        <AlertCircle className='w-12 h-12 text-red-500' />
        <p className='text-red-600 font-medium'>{error}</p>
        <Button onClick={() => window.open(url, '_blank')} variant='outline'>
          Mở trong tab mới
        </Button>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* PDF Document - Scrollable all pages */}
      <div className='flex-1 overflow-auto bg-slate-100'>
        <div className='flex flex-col items-center py-4 gap-4'>
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className='flex items-center justify-center py-12'>
                <Loader2 className='w-8 h-8 animate-spin text-blue-500' />
              </div>
            }
          >
            {/* Render all pages */}
            {Array.from(new Array(numPages), (_, index) => (
              <div key={`page_${index + 1}`} className='mb-4'>
                <Page
                  pageNumber={index + 1}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className='shadow-lg'
                  width={Math.min(window.innerWidth * 0.8, 900)}
                />
                {/* Page number indicator */}
                <div className='text-center mt-2 text-sm text-slate-600'>
                  Trang {index + 1} / {numPages}
                </div>
              </div>
            ))}
          </Document>
        </div>
      </div>
    </div>
  )
}
