import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface UserCredentials {
  nickname: string
  password: string
}

const NicknamePasswordSettings: React.FC = () => {
  const [userData, setUserData] = useState<UserCredentials>({
    nickname: 'Biệt danh',
    password: '********'
  })

  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)

  const [newNickname, setNewNickname] = useState(userData.nickname)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [nicknameError, setNicknameError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleNicknameEdit = () => {
    if (newNickname === 'DEGEN') {
      setNicknameError('Biệt danh đang được sử dụng.')
      return
    }
    if (newNickname.length > 0 && newNickname.length <= 10) {
      setUserData({
        ...userData,
        nickname: newNickname
      })
      setIsEditingNickname(false)
      setNicknameError('')
    } else {
      setNicknameError('Vui lòng nhập biệt danh từ 1-10 ký tự.')
    }
  }

  const handlePasswordEdit = () => {
    if (currentPassword !== userData.password) {
      setPasswordError('Mật khẩu hiện tại không đúng.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu mới và xác nhận mật khẩu không khớp.')
      setNewPassword('')
      setConfirmPassword('')
      return
    }

    setUserData({
      ...userData,
      password: '********'
    })
    setIsEditingPassword(false)
    setPasswordError('')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className='flex min-h-screen bg-gray-100'>
      <div className='flex-1 p-8 flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6'>
        <Card className='w-full md:w-1/2'>
          <CardHeader>
            <CardTitle>My_nickname</CardTitle>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='space-y-4'>
              <div className='flex items-center space-x-2'>
                <Input
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  placeholder='Biệt danh'
                  className={`flex-1 ${nicknameError ? 'border-red-500' : ''}`}
                  disabled={!isEditingNickname}
                />
                <Button
                  onClick={() => {
                    if (isEditingNickname) {
                      handleNicknameEdit()
                    } else {
                      setIsEditingNickname(true)
                      setNewNickname(userData.nickname)
                    }
                  }}
                  variant='outline'
                  size='sm'
                  className='h-10'
                >
                  Xác nhận
                </Button>
              </div>

              {nicknameError ? (
                <p className='text-xs text-red-500'>{nicknameError}</p>
              ) : (
                <p className='text-xs text-gray-500'>*Tối đa 10 ký tự.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className='w-full md:w-1/2'>
          <CardHeader>
            <CardTitle>My_PW</CardTitle>
          </CardHeader>
          <CardContent className='p-6'>
            <div className='space-y-4'>
              {isEditingPassword ? (
                <div className='space-y-3'>
                  <Input
                    type='password'
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder='Nhập mật khẩu hiện tại.'
                    className={passwordError ? 'border-red-500' : ''}
                  />

                  <Input
                    type='password'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder='Nhập mật khẩu mới.'
                    className={passwordError ? 'border-red-500' : ''}
                  />

                  <Input
                    type='password'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder='Xác nhận mật khẩu mới.'
                    className={passwordError ? 'border-red-500' : ''}
                  />

                  {passwordError && <p className='text-xs text-red-500'>{passwordError}</p>}

                  <div className='flex justify-end space-x-2 pt-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => {
                        setIsEditingPassword(false)
                        setPasswordError('')
                        setCurrentPassword('')
                        setNewPassword('')
                        setConfirmPassword('')
                      }}
                    >
                      Hủy
                    </Button>
                    <Button variant='default' size='sm' onClick={handlePasswordEdit}>
                      Hoàn thành
                    </Button>
                  </div>
                </div>
              ) : (
                <Input
                  type='password'
                  value={userData.password}
                  disabled
                  className='mb-4'
                  onClick={() => setIsEditingPassword(true)}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default NicknamePasswordSettings
