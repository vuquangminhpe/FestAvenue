import AccountSettings from './AccountSettings'
import { Helmet } from 'react-helmet-async'

export default function UserProfile() {
  return (
    <div className='w-full mx-auto'>
      <Helmet>
        <title>Cài đặt tài khoản - Hồ sơ người dùng</title>
        <meta name='description' content='Cài đặt thông tin tài khoản và quản lý thông tin cá nhân.' />
      </Helmet>

      <AccountSettings />
    </div>
  )
}
