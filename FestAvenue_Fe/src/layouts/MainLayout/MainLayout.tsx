interface Props {
  children: React.ReactNode
}

export default function MainLayout({ children }: Props) {
  return <div className='w-full min-h-screen flex flex-col max-w-[1920px] mx-auto'>{children}</div>
}
