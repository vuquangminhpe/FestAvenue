import Footer from '@/pages/User/Public/Footer/Footer'

interface Props {
  children: React.ReactNode
}

export default function MainLayout({ children }: Props) {
  return (
    <div className='w-full min-h-screen flex flex-col max-w-[1920px] mx-auto'>
      <div>{children}</div>
      <Footer />
    </div>
  )
}
