import { LoaderCircle } from 'lucide-react'
import { lazy, Suspense } from 'react'

const Icons = {
  BellOutline: lazy(() => import('./BellOutline')),
  UserOutline: lazy(() => import('./UserOutline')),
  CardOutline: lazy(() => import('./CardOutline')),
  DefaultImageOutline: lazy(() => import('./DefaultImageOutline')),
  Search: lazy(() => import('./Search')),
  Calendar: lazy(() => import('./Calendar')),
  Book: lazy(() => import('./Book')),
  Message: lazy(() => import('./Message')),
  DefaultImage1: lazy(() => import('./DefaultImage1')),
  BookOutline: lazy(() => import('./BookOutline')),
  CommentOutline: lazy(() => import('./CommentOutline')),
  ArrowLeft: lazy(() => import('./ArrowLeft')),
  Cash: lazy(() => import('./Cash')),
  CardPlus: lazy(() => import('./CardPlus')),
  CardCheck: lazy(() => import('./CardCheck')),
  Close: lazy(() => import('./Close')),
  Download: lazy(() => import('./Download')),
  Bookmark: lazy(() => import('./Bookmark')),
  Eye: lazy(() => import('./Eye')),
  Menu: lazy(() => import('./Menu')),
  ChevronLeft: lazy(() => import('./ChevronLeft')),
  Share: lazy(() => import('./Share')),
  Loading: lazy(() => import('./Loading')),
  Upload: lazy(() => import('./Upload')),
  Bolt: lazy(() => import('./Bolt')),
  KaKao: lazy(() => import('./Kakao')),
  Google: lazy(() => import('./Google')),
  Plus: lazy(() => import('./Plus')),
  ChevronRight: lazy(() => import('./ChevronRight')),
  Pen: lazy(() => import('./Pen')),
  Trash: lazy(() => import('./Trash')),
  NotDisturb: lazy(() => import('./NotDisturb')),
  CardPlusWhite: lazy(() => import('./CardPlusWhite')),
  Organization: lazy(() => import('./Organization'))
}

const CustomIcon = ({ name, ...props }: { name: keyof typeof Icons; [key: string]: any }) => {
  const Component = Icons[name]
  return (
    <Suspense
      fallback={
        <div>
          <LoaderCircle className='size-4' />
        </div>
      }
    >
      <Component {...props} />
    </Suspense>
  )
}

export default CustomIcon
