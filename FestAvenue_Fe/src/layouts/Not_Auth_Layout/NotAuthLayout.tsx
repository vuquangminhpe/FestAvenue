interface Props {
  img?: string
  children: React.ReactNode
}

export default function NotAuthLayout({ img, children }: Props) {
  return (
    <div className='min-h-screen flex'>
      {/* Left Side - Image */}
      <div className='hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden'>
        {img && (
          <>
            <img src={img} alt='Login background' className='w-full h-full object-cover' />
            <div className='absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-black/30' />

            <div className='absolute bottom-8 left-8 text-white'>
              <h2 className='text-3xl font-bold mb-2'>Welcome to FestAvenue</h2>
              <p className='text-lg opacity-90'>Discover amazing events around you</p>
            </div>
          </>
        )}
      </div>

      {/* Right Side - Form */}
      <div className='w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 lg:p-8 bg-gray-50'>
        <div className='w-full'>{children}</div>
      </div>
    </div>
  )
}
