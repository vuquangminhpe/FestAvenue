import LOGO_IMG from '../../../../../public/Images/logo.png'
export default function Header() {
  return (
    <div className={`relative w-full max-h-[50px] bg-[url('')] bg-cover rounded-xl bg-center`}>
      <div className='relative z-10 flex items-center text-center justify-around  max-w-md mx-auto mt-7 p-3 backdrop-blur-lg bg-white/20 border border-gray-300/30 rounded-2xl shadow-lg'>
        <div className='text-white text-[15px] font-medium cursor-pointer hover:text-white/80 transition-colors'>
          Login
        </div>
        <div className='text-white text-[15px] font-medium cursor-pointer hover:text-white/80 transition-colors'>
          SignUp
        </div>
        <div className='flex items-center'>
          <img src={LOGO_IMG} className='rounded-md size-12 object-cover' alt='Logo' />
        </div>
        <p className='text-white/90 font-semibold text-[15px]'>Fest Avenue</p>
        <p className='text-white/90 font-semibold text-[15px]'>Fest event</p>
      </div>
    </div>
  )
}
