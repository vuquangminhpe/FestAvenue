/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button'
import { Form, FormField } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import path from '@/constants/path'
import { cn } from '@/lib/utils'
import { clearLocalStorage } from '@/utils/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LoaderCircle, Edit3, Camera, User, Mail, LogOut, Trash2 } from 'lucide-react'
import React, { Fragment, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'

import ImageCropper from './ImageCropper/ImageCropper'
import defaultAvatar from '../../../../../../../public/Images/default-avatar.png'
import { Card, CardContent } from '@/components/ui/card'
import userApi from '@/apis/user.api'
import { useUsersStore } from '@/contexts/app.context'

const WRONG_CURRENT_PASSWORD_MESS = 'Wrong current password.'

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Trường này là bắt buộc'),
    newPassword: z.string().min(1, 'Trường này là bắt buộc'),
    confirmPassword: z.string().min(1, 'Trường này là bắt buộc')
  })
  .superRefine(({ newPassword, confirmPassword }, ctx) => {
    if (confirmPassword !== newPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Mật khẩu không khớp',
        path: ['confirmPassword']
      })
    }
  })

const AccountSettings: React.FC = () => {
  const [isEditingNickname, setIsEditingNickname] = useState(false)
  const [isEditingPassword, setIsEditingPassword] = useState(false)
  const [isEditingPhone, setIsEditingPhone] = useState(false)
  const [isEditingFirstname, setIsEditingFirstname] = useState(false)
  const [newNickname, setNewNickname] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newFirstname, setNewFirstname] = useState('')
  const [newAvatar, setNewAvatar] = useState<File>()
  const [newAvatarURL, setNewAvatarURL] = useState<string>()
  const [showImageCropper, setShowImageCropper] = useState(false)
  const [originalImageURL, setOriginalImageURL] = useState<string>()
  const isProfile = useUsersStore((data) => data.isProfile)
  const [nicknameError, setNicknameError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [firstnameError, setFirstnameError] = useState('')
  // const deletedAccountMutation = useMutation({
  //   mutationFn: () => userApi.deleteAccount(),
  //   onSuccess: () => {
  //     toast.success('Hủy tài khoản thành công.')

  //     handleLogout()
  //   }
  // })

  const deletedImagesStorageMutation = useMutation({
    mutationFn: userApi.deletedFileStorage
  })
  const { isProfile: userProfile, setIsAuth, setUserAvatar } = useUsersStore((state) => state)

  const queryClient = useQueryClient()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })
  const updateAvatarMutation = useMutation({
    mutationFn: userApi.updateAvatarProfile
  })
  const { isPending: pendingUpdateProfile, mutateAsync: updateProfileMutation } = useMutation({
    mutationFn: userApi.updateMyProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getMyProfile'] })
    }
  })
  const deletedAccountMutation = useMutation({
    mutationFn: userApi.deleteMyAccount
  })
  const uploadsStorageMutation = useMutation({
    mutationFn: (file: File) => userApi.uploadsStorage(file)
  })
  const updatePasswordMutation = useMutation({
    mutationFn: userApi.updateMyPassword
  })

  const handleClickUploadAvatar = () => {
    if (avatarInputRef.current) {
      avatarInputRef.current.click()
    }
  }

  const handleCancelUploadAvatar = () => {
    setNewAvatar(undefined)
    setNewAvatarURL(undefined)
    setOriginalImageURL(undefined)
    if (avatarInputRef.current) {
      avatarInputRef.current.value = ''
    }
  }

  // Modified to open the image cropper instead of directly setting the image
  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      const url = URL.createObjectURL(file)
      setOriginalImageURL(url)
      setShowImageCropper(true)
    }
  }

  // Handle the cropped image from the ImageCropper component
  const handleCroppedImage = (croppedBlob: Blob) => {
    // Create a File from the Blob to maintain compatibility with existing code
    const croppedFile = new File([croppedBlob], 'cropped-avatar.jpg', {
      type: 'image/jpeg',
      lastModified: new Date().getTime()
    })

    setNewAvatar(croppedFile)
    setNewAvatarURL(URL.createObjectURL(croppedBlob))
    setShowImageCropper(false)
  }

  const handleUpdateAvatar = async () => {
    if (newAvatar) {
      if (isProfile?.avatar) {
        try {
          await deletedImagesStorageMutation.mutateAsync(isProfile.avatar)
        } catch (error) {
          console.error('Không thể xóa ảnh cũ:', error)
        }
      }

      uploadsStorageMutation.mutateAsync(newAvatar, {
        onSuccess: (data) => {
          updateAvatarMutation.mutateAsync(
            { avatar: data?.data as unknown as string },
            {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['getMyProfile'] })
                toast.success('Cập nhật ảnh thành công')
                handleCancelUploadAvatar()
              },
              onError: () => {
                toast.error('Cập nhật ảnh thất bại')
              }
            }
          )
        },
        onError: () => {
          toast.error('Cập nhật thất bại, hãy thử lại trong ít phút !!!')
        }
      })
    }
  }

  const toggleEditNickName = (isEdit: boolean) => {
    setIsEditingNickname(isEdit)
    setNewNickname('')
    setNicknameError('')
  }

  const toggleEditFirstname = (isEdit: boolean) => {
    setIsEditingFirstname(isEdit)
    if (isEdit) {
      setNewFirstname(userProfile?.firstName || '')
    } else {
      setNewFirstname('')
    }
    setFirstnameError('')
  }

  const toggleEditPhone = (isEdit: boolean) => {
    setIsEditingPhone(isEdit)
    if (isEdit) {
      setNewPhone(userProfile?.phone || '')
    } else {
      setNewPhone('')
    }
    setPhoneError('')
  }

  const handleNicknameEdit = async () => {
    if (newNickname.length > 0 && newNickname.length <= 10) {
      await updateProfileMutation(
        { lastName: newNickname },
        {
          onSuccess: () => {
            toast.success('Tên đã được cập nhật thành công.')
            setIsEditingNickname(false)
            setNicknameError('')
          },
          onError: () => {
            toast.error('Cật nhật thất bại')
          }
        }
      )
    } else {
      setNicknameError('Vui lòng nhập tên từ 1-10 ký tự.')
    }
  }

  const handleFirstnameEdit = async () => {
    if (newFirstname.length > 0 && newFirstname.length <= 20) {
      await updateProfileMutation(
        { firstName: newFirstname },
        {
          onSuccess: () => {
            toast.success('Họ đã được cập nhật thành công.')
            setIsEditingFirstname(false)
            setFirstnameError('')
          },
          onError: () => {
            toast.error('Cật nhật thất bại')
          }
        }
      )
    } else {
      setFirstnameError('Vui lòng nhập họ từ 1-20 ký tự.')
    }
  }

  const handlePhoneEdit = async () => {
    const phoneRegex = /^\d{10,11}$/
    if (!phoneRegex.test(newPhone)) {
      setPhoneError('Vui lòng nhập số điện thoại hợp lệ (10-11 số).')
      return
    }
    await updateProfileMutation({ phone: newPhone })
    toast.success('số điện thoại đã được cập nhật thành công.')
  }

  async function onSubmitPassword(values: z.infer<typeof passwordSchema>) {
    await updatePasswordMutation.mutateAsync(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmPassword
      },
      {
        onSuccess: () => {
          toast.success('Mật khẩu đã được cập nhật thành công')
        },
        onError: (error: any) => {
          if (error?.data?.data === WRONG_CURRENT_PASSWORD_MESS) {
            toast.error('Mật khẩu hiện tại sai')
          } else {
            toast.error('Lỗi xảy ra khi cập nhật mật khẩu')
          }
        },
        onSettled: () => {
          setIsEditingPassword(false)
          passwordForm.reset()
        }
      }
    )
  }

  const handleLogout = () => {
    setIsAuth(false)
    setUserAvatar('')
    clearLocalStorage()
    navigate(path.home)
  }
  const handleDeletedAccount = async () => {
    deletedAccountMutation.mutateAsync()
  }

  return (
    <Fragment>
      <div className='bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 min-h-screen'>
        <div className=' mx-auto w-full'>
          {/* Header */}
          <div className='mb-6'>
            <h1 className='text-[28px] font-semibold text-slate-800 mb-2'>Thông tin tài khoản</h1>
          </div>

          {/* Main Card */}
          <Card className='bg-white/80 backdrop-blur-sm shadow-lg border border-white/50 mb-6'>
            <CardContent className='p-6'>
              <div className='flex flex-col max-md:flex-row gap-8'>
                {/* Left column with avatar */}
                <div className='flex justify-start'>
                  <div className='flex flex-col items-center space-y-4'>
                    <div className='relative group'>
                      <div className='size-36 flex rounded-full overflow-hidden ring-4 ring-white shadow-xl'>
                        <img
                          src={newAvatarURL || isProfile?.avatar || defaultAvatar}
                          alt='avatar'
                          className='w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-110'
                        />
                        <div className='flex translate-y-14 translate-x-44 absolute flex-col font-inter capitalize text-black gap-3'>
                          <div className='flex items-center gap-2'>
                            <div className='size-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600'></div>
                            <div className='text-[16px] font-semibold tracking-tight line-clamp-1'>
                              {userProfile?.email}
                            </div>
                          </div>
                          <div className='flex items-center gap-2 text-slate-600 pl-4'>
                            <div className='text-[14px] truncate'>{`${userProfile?.firstName}  ${userProfile?.lastName}`}</div>
                          </div>{' '}
                        </div>
                      </div>
                      <div
                        className='absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer'
                        onClick={handleClickUploadAvatar}
                      >
                        <Camera className='w-6 h-6 text-white' />
                      </div>
                    </div>

                    <input
                      ref={avatarInputRef}
                      type='file'
                      accept='image/jpeg,image/png'
                      className='hidden'
                      onChange={handleProfileImageChange}
                    />

                    {newAvatar ? (
                      <div className='flex gap-3 w-full'>
                        <Button
                          disabled={pendingUpdateProfile}
                          size='sm'
                          variant='outline'
                          onClick={handleCancelUploadAvatar}
                          className='flex-1 rounded-lg'
                        >
                          Hủy
                        </Button>
                        <Button
                          disabled={pendingUpdateProfile}
                          size='sm'
                          variant='default'
                          className='flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                          onClick={handleUpdateAvatar}
                        >
                          {pendingUpdateProfile ? <LoaderCircle className='w-4 h-4 animate-spin mr-2' /> : null}
                          Lưu
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={handleClickUploadAvatar}
                        className='max-w-[200px] rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300'
                        size='sm'
                      >
                        <Camera className='w-4 h-4 mr-2' />
                        Thay đổi hồ sơ
                      </Button>
                    )}
                  </div>
                </div>

                {/* Right column with two sections */}
                <div className='w-full'>
                  <div className='flex flex-col lg:flex-row gap-14'>
                    {/* First column: Name, Email, Nickname */}
                    <div className='flex-1 space-y-10'>
                      {/* Firstname Field */}
                      <div className='space-y-2'>
                        <label className='text-sm font-medium text-slate-700 flex items-center gap-2'>
                          <User className='w-4 h-4' />
                          Họ
                        </label>
                        <div className='relative'>
                          <Input
                            value={
                              isEditingFirstname ? newFirstname : userProfile ? userProfile.firstName : 'Không có họ'
                            }
                            placeholder='Nhập họ'
                            maxLength={20}
                            onChange={(e) => setNewFirstname(e.target.value)}
                            disabled={pendingUpdateProfile || !isEditingFirstname}
                            className={cn(
                              'h-12 pr-24 rounded-lg transition-all duration-200',
                              firstnameError
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200',
                              isEditingFirstname ? 'bg-white' : 'bg-slate-50'
                            )}
                          />
                          {!isEditingFirstname ? (
                            <button
                              onClick={() => toggleEditFirstname(true)}
                              className='absolute right-3 top-1/2 -translate-y-1/2 text-white text-xs font-medium py-2 px-3 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200'
                            >
                              Chỉnh sửa
                            </button>
                          ) : (
                            <div className='absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2'>
                              <Button
                                variant='outline'
                                size='sm'
                                className='text-xs px-3 py-1 h-8 rounded-md'
                                onClick={() => toggleEditFirstname(false)}
                              >
                                Hủy
                              </Button>
                              <Button
                                onClick={handleFirstnameEdit}
                                variant='default'
                                size='sm'
                                className='text-xs px-3 py-1 h-8 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                              >
                                {pendingUpdateProfile ? <LoaderCircle className='w-3 h-3 animate-spin mr-1' /> : null}
                                Hoàn thành
                              </Button>
                            </div>
                          )}
                        </div>
                        {firstnameError ? (
                          <p className='text-xs text-red-500 mt-1'>{firstnameError}</p>
                        ) : (
                          <p className='text-xs text-slate-500'>*Có thể thay đổi tối đa 20 ký tự.</p>
                        )}
                      </div>
                      {/* Lastname Field */}
                      <div className='space-y-2'>
                        <label className='text-sm font-medium text-slate-700 flex items-center gap-2'>
                          <Edit3 className='w-4 h-4' />
                          Tên
                        </label>
                        <div className='relative'>
                          <Input
                            value={isEditingNickname ? newNickname : userProfile ? userProfile.lastName : ''}
                            placeholder='Nhập tên'
                            maxLength={10}
                            onChange={(e) => setNewNickname(e.target.value)}
                            disabled={pendingUpdateProfile || !isEditingNickname}
                            className={cn(
                              'h-12 pr-24 rounded-lg transition-all duration-200',
                              nicknameError
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200',
                              isEditingNickname ? 'bg-white' : 'bg-slate-50'
                            )}
                          />
                          {!isEditingNickname ? (
                            <button
                              onClick={() => toggleEditNickName(true)}
                              className='absolute right-3 top-1/2 -translate-y-1/2 text-white text-xs font-medium py-2 px-3 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200'
                            >
                              Chỉnh sửa
                            </button>
                          ) : (
                            <div className='absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2'>
                              <Button
                                variant='outline'
                                size='sm'
                                className='text-xs px-3 py-1 h-8 rounded-md'
                                onClick={() => toggleEditNickName(false)}
                              >
                                Hủy
                              </Button>
                              <Button
                                onClick={handleNicknameEdit}
                                variant='default'
                                size='sm'
                                className='text-xs px-3 py-1 h-8 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                              >
                                {pendingUpdateProfile ? <LoaderCircle className='w-3 h-3 animate-spin mr-1' /> : null}
                                Hoàn thành
                              </Button>
                            </div>
                          )}
                        </div>
                        {nicknameError ? (
                          <p className='text-xs text-red-500 mt-1'>{nicknameError}</p>
                        ) : (
                          <p className='text-xs text-slate-500'>*Có thể thay đổi tối đa 10 ký tự.</p>
                        )}
                      </div>
                      {/* Email Field */}
                      <div className='space-y-2'>
                        <label className='text-sm font-medium text-slate-700 flex items-center gap-2'>
                          <Mail className='w-4 h-4' />
                          Email
                        </label>
                        <Input
                          defaultValue={userProfile?.email}
                          disabled
                          className='h-12 bg-slate-50 border-slate-200 rounded-lg'
                        />
                        <p className='text-xs text-slate-500'>*Không thể chỉnh sửa email.</p>
                      </div>
                    </div>

                    {/* Second column: Phone, Password */}
                    <div className='flex-1 space-y-10'>
                      {/* Phone Number Field */}
                      <div className='space-y-2'>
                        <label className='text-sm font-medium text-slate-700'>Số điện thoại</label>
                        <div className='relative'>
                          <Input
                            value={isEditingPhone ? newPhone : userProfile?.phone || ''}
                            placeholder='Nhập số điện thoại'
                            onChange={(e) => setNewPhone(e.target.value)}
                            disabled={pendingUpdateProfile || !isEditingPhone}
                            className={cn(
                              'h-12 pr-24 rounded-lg transition-all duration-200',
                              phoneError
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200',
                              isEditingPhone ? 'bg-white' : 'bg-slate-50'
                            )}
                          />
                          {!isEditingPhone ? (
                            <button
                              onClick={() => toggleEditPhone(true)}
                              className='absolute right-3 top-1/2 -translate-y-1/2 text-white text-xs font-medium py-2 px-3 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200'
                            >
                              Chỉnh sửa
                            </button>
                          ) : (
                            <div className='absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2'>
                              <Button
                                variant='outline'
                                size='sm'
                                className='text-xs px-3 py-1 h-8 rounded-md'
                                onClick={() => toggleEditPhone(false)}
                              >
                                Hủy
                              </Button>
                              <Button
                                onClick={handlePhoneEdit}
                                variant='default'
                                size='sm'
                                className='text-xs px-3 py-1 h-8 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                              >
                                {pendingUpdateProfile ? <LoaderCircle className='w-3 h-3 animate-spin mr-1' /> : null}
                                Hoàn thành
                              </Button>
                            </div>
                          )}
                        </div>
                        {phoneError ? (
                          <p className='text-xs text-red-500 mt-1'>{phoneError}</p>
                        ) : (
                          <p className='text-xs text-slate-500'>*Nhập số điện thoại của bạn.</p>
                        )}
                      </div>

                      {/* Password Field */}
                      <div className='space-y-2'>
                        <label className='text-sm font-medium text-slate-700'>Mật khẩu</label>
                        {isEditingPassword ? (
                          <Form {...passwordForm}>
                            <div className='space-y-4'>
                              <FormField
                                control={passwordForm.control}
                                name='currentPassword'
                                render={({ field, fieldState: { error } }) => (
                                  <div className='space-y-1'>
                                    <Input
                                      {...field}
                                      type='password'
                                      placeholder='Nhập mật khẩu hiện tại.'
                                      className={cn(
                                        'h-12 rounded-lg transition-all duration-200',
                                        error
                                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                          : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200'
                                      )}
                                      disabled={updatePasswordMutation.isPending}
                                    />
                                    {error && <p className='text-xs text-red-500'>{error.message}</p>}
                                  </div>
                                )}
                              />
                              <FormField
                                control={passwordForm.control}
                                name='newPassword'
                                render={({ field, fieldState: { error } }) => (
                                  <div className='space-y-1'>
                                    <Input
                                      {...field}
                                      type='password'
                                      placeholder='Nhập mật khẩu mới.'
                                      className={cn(
                                        'h-12 rounded-lg transition-all duration-200',
                                        error
                                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                          : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200'
                                      )}
                                      disabled={updatePasswordMutation.isPending}
                                    />
                                    {error && <p className='text-xs text-red-500'>{error.message}</p>}
                                  </div>
                                )}
                              />
                              <FormField
                                control={passwordForm.control}
                                name='confirmPassword'
                                render={({ field, fieldState: { error } }) => (
                                  <div className='space-y-1'>
                                    <Input
                                      {...field}
                                      type='password'
                                      placeholder='Nhập lại mật khẩu mới một lần nữa.'
                                      className={cn(
                                        'h-12 rounded-lg transition-all duration-200',
                                        error
                                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                                          : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200'
                                      )}
                                      disabled={updatePasswordMutation.isPending}
                                    />
                                    {error && <p className='text-xs text-red-500'>{error.message}</p>}
                                  </div>
                                )}
                              />
                              <div className='flex justify-end gap-3 pt-2'>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  onClick={() => {
                                    setIsEditingPassword(false)
                                    passwordForm.reset()
                                  }}
                                  disabled={updatePasswordMutation.isPending}
                                  type='button'
                                  className='rounded-lg'
                                >
                                  Hủy
                                </Button>
                                <Button
                                  disabled={updatePasswordMutation.isPending}
                                  variant='default'
                                  size='sm'
                                  onClick={passwordForm.handleSubmit(onSubmitPassword)}
                                  className='rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                                >
                                  {updatePasswordMutation.isPending ? (
                                    <LoaderCircle className='w-4 h-4 animate-spin mr-2' />
                                  ) : null}
                                  Hoàn thành
                                </Button>
                              </div>
                            </div>
                          </Form>
                        ) : (
                          <div className='relative'>
                            <Input
                              defaultValue='●●●●●●●●●●●●'
                              type='text'
                              className='h-12 pr-20 bg-slate-50 border-slate-200 rounded-lg'
                              readOnly
                            />
                            <button
                              onClick={() => setIsEditingPassword(true)}
                              className='absolute right-3 top-1/2 -translate-y-1/2 text-white text-xs font-medium py-2 px-3 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200'
                            >
                              Chỉnh sửa
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons outside card */}
          <div className='flex justify-between items-center'>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant='outline'
                  className='text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 rounded-lg'
                >
                  <Trash2 className='w-4 h-4 mr-2' />
                  Rời khỏi
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className='rounded-2xl'>
                <AlertDialogHeader>
                  <AlertDialogTitle>Khi rời khỏi, tài khoản sẽ bị xóa và không thể khôi phục!</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className='rounded-lg'>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    className='bg-red-500 text-white hover:bg-red-600 rounded-lg'
                    onClick={handleDeletedAccount}
                  >
                    Tiếp tục
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button onClick={handleLogout} variant='outline' className='rounded-lg' size='sm'>
              <LogOut className='w-4 h-4 mr-2' />
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      {/* Image Cropper component */}
      {originalImageURL && (
        <ImageCropper
          isOpen={showImageCropper}
          onClose={() => {
            setShowImageCropper(false)
            handleCancelUploadAvatar()
          }}
          imageUrl={originalImageURL}
          onCropComplete={handleCroppedImage}
        />
      )}
    </Fragment>
  )
}

export default AccountSettings
