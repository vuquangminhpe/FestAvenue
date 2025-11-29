import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
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
  const [pageNumber, setPageNumber] = useState<number>(1)
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

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages))
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
      {/* PDF Document */}
      <div className='flex-1 overflow-auto flex items-center justify-center bg-slate-100'>
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
          <Page
            pageNumber={pageNumber}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className='shadow-lg'
            width={Math.min(window.innerWidth * 0.8, 900)}
          />
        </Document>
      </div>

      {/* Navigation Controls */}
      {numPages > 1 && (
        <div className='flex items-center justify-center gap-4 py-4 bg-white border-t'>
          <Button onClick={goToPrevPage} disabled={pageNumber <= 1} variant='outline' size='sm'>
            <ChevronLeft className='w-4 h-4' />
          </Button>

          <span className='text-sm text-slate-600'>
            Trang {pageNumber} / {numPages}
          </span>

          <Button onClick={goToNextPage} disabled={pageNumber >= numPages} variant='outline' size='sm'>
            <ChevronRight className='w-4 h-4' />
          </Button>
        </div>
      )}
    </div>
  )
}
