import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FacebookShareButton, TwitterShareButton, FacebookIcon, XIcon } from 'react-share'

interface ShareDialogProps {
  children: React.ReactNode
  title: string
  description?: string
}

export default function ShareDialog({ children, title, description }: ShareDialogProps) {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = description ? `${title} - ${description}` : title

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Chia sẻ sự kiện</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-4 py-4'>
          <div className='text-sm text-gray-600 mb-2'>Chia sẻ sự kiện này đến:</div>
          <div className='flex gap-4 justify-center'>
            <FacebookShareButton url={shareUrl} hashtag='#event' className='hover:opacity-80 transition-opacity'>
              <FacebookIcon size={48} round />
            </FacebookShareButton>

            <TwitterShareButton
              url={shareUrl}
              title={shareTitle}
              className='hover:opacity-80 transition-opacity'
            >
              <XIcon size={48} round />
            </TwitterShareButton>
          </div>
          <div className='text-xs text-gray-500 text-center mt-2'>
            * Instagram không hỗ trợ chia sẻ từ web
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
