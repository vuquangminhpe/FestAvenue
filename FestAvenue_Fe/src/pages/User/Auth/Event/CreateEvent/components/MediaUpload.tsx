import { useState, useRef, Suspense, lazy } from 'react'
import { FormControl, FormDescription, FormItem, FormLabel } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Loader2, CheckCircle2, AlertTriangle, Image as ImageIcon, Video, ShieldCheck, Info } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import type { EventFormData } from '../types'
import type { MediaDetectionResult } from '../hooks/useAIDetection'
import userApi from '@/apis/user.api'
import mediaApis from '@/apis/media.api'
import AIApis from '@/apis/AI.api'
import { toast } from 'sonner'

const VideoHLSPlayer = lazy(() => import('@/components/custom/VideoHLSPlayer/VideoHLSPlayer'))

interface MediaUploadProps {
  form: UseFormReturn<EventFormData>
  logoDetection: MediaDetectionResult | null
  bannerDetection: MediaDetectionResult | null
  trailerDetection: MediaDetectionResult | null
  onLogoUpload: (file: File) => void
  onBannerUpload: (file: File) => void
  onTrailerUpload: (file: File) => void
  onDetectLogo: (file: File, url: string, isSafe?: boolean) => Promise<boolean>
  onDetectBanner: (file: File, url: string, isSafe?: boolean) => Promise<boolean>
  onDetectTrailer: (file: File, url: string, isSafe?: boolean) => Promise<boolean>
  onResetDetection: (type: 'logo' | 'banner' | 'trailer') => void
}

export function MediaUpload({
  form,
  logoDetection,
  bannerDetection,
  trailerDetection,
  onLogoUpload,
  onBannerUpload,
  onTrailerUpload,
  onDetectLogo,
  onDetectBanner,
  onDetectTrailer,
  onResetDetection
}: MediaUploadProps) {
  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const trailerInputRef = useRef<HTMLInputElement>(null)

  const [logoPreview, setLogoPreview] = useState<string>('')
  const [bannerPreview, setBannerPreview] = useState<string>('')
  const [trailerPreview, setTrailerPreview] = useState<string>('')

  const [isCheckingLogo, setIsCheckingLogo] = useState(false)
  const [isCheckingBanner, setIsCheckingBanner] = useState(false)
  const [isCheckingTrailer, setIsCheckingTrailer] = useState(false)

  // Store selected files (NOT uploaded yet)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [trailerFile, setTrailerFile] = useState<File | null>(null)

  // Handle file selection (just preview, no upload)
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File không được lớn hơn 5MB')
      return
    }

    // Just create preview, don't upload
    const preview = URL.createObjectURL(file)
    setLogoPreview(preview)
    setLogoFile(file)
    onLogoUpload(file)
    toast.info('File đã chọn. Hãy bấm "Kiểm tra AI" để xác thực')
  }

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File không được lớn hơn 10MB')
      return
    }

    const preview = URL.createObjectURL(file)
    setBannerPreview(preview)
    setBannerFile(file)
    onBannerUpload(file)
    toast.info('File đã chọn. Hãy bấm "Kiểm tra AI" để xác thực')
  }

  const handleTrailerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      toast.error('Vui lòng chọn file video')
      return
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('File không được lớn hơn 100MB')
      return
    }

    const preview = URL.createObjectURL(file)
    setTrailerPreview(preview)
    setTrailerFile(file)
    onTrailerUpload(file)
    toast.info('File đã chọn. Hãy bấm "Kiểm tra AI" để xác thực')
  }

  // AI Detection THEN Upload
  const handleDetectAndUploadLogo = async () => {
    if (!logoFile) return

    try {
      setIsCheckingLogo(true)
      toast.info('Đang kiểm tra nội dung với AI...')

      // Step 1: AI Detection
      const detectResult = await AIApis.detectImageWithAI(logoFile)
      const isSafe = (detectResult as any)?.is_safe || false

      if (!isSafe) {
        toast.error('Hình ảnh chứa nội dung không phù hợp', {
          description: 'Vui lòng chọn hình ảnh khác'
        })
        await onDetectLogo(logoFile, '', false) // Pass isSafe = false
        return
      }

      toast.success('Nội dung an toàn! Đang tải lên...')

      // Step 2: Upload to storage (only if AI passed)
      const uploadResult = await userApi.uploadsStorage(logoFile)
      const url = (uploadResult as any)?.data || ''
      console.log(url)

      form.setValue('logoUrl', url)
      await onDetectLogo(logoFile, url, true) // Pass isSafe = true
      toast.success('Tải logo lên thành công!')
    } catch (error) {
      toast.error('Lỗi khi xử lý logo')
      onResetDetection('logo')
    } finally {
      setIsCheckingLogo(false)
    }
  }

  const handleDetectAndUploadBanner = async () => {
    if (!bannerFile) return

    try {
      setIsCheckingBanner(true)
      toast.info('Đang kiểm tra nội dung với AI...')

      // Step 1: AI Detection
      const detectResult = await AIApis.detectImageWithAI(bannerFile)
      const isSafe = (detectResult as any)?.is_safe || false

      if (!isSafe) {
        toast.error('Hình ảnh chứa nội dung không phù hợp', {
          description: 'Vui lòng chọn hình ảnh khác'
        })
        await onDetectBanner(bannerFile, '', false) // Pass isSafe = false
        return
      }

      toast.success('Nội dung an toàn! Đang tải lên...')

      // Step 2: Upload to storage
      const uploadResult = await userApi.uploadsStorage(bannerFile)
      const url = (uploadResult as any)?.data || ''

      form.setValue('bannerUrl', url)
      await onDetectBanner(bannerFile, url, true) // Pass isSafe = true
      toast.success('Tải banner lên thành công!')
    } catch (error) {
      toast.error('Lỗi khi xử lý banner')
      onResetDetection('banner')
    } finally {
      setIsCheckingBanner(false)
    }
  }

  const handleDetectAndUploadTrailer = async () => {
    if (!trailerFile) return

    try {
      setIsCheckingTrailer(true)
      toast.info('Đang kiểm tra video với AI...')

      // Step 1: AI Detection
      const detectResult = await AIApis.detectVideoWithAI(trailerFile)
      const isSafe = (detectResult as any)?.is_safe || false

      if (!isSafe) {
        toast.error('Video chứa nội dung không phù hợp', {
          description: 'Vui lòng chọn video khác'
        })
        await onDetectTrailer(trailerFile, '', false) // Pass isSafe = false
        return
      }

      toast.success('Nội dung an toàn! Đang xử lý và tải lên...')

      // Step 2: Upload and convert to HLS 720p
      const uploadResult = await mediaApis.uploadVideo720P(trailerFile)
      const videoUrl = (uploadResult as any)?.data?.data || ''

      form.setValue('trailerUrl', videoUrl)
      await onDetectTrailer(trailerFile, videoUrl, true) // Pass isSafe = true
      toast.success('Tải trailer lên thành công!')
    } catch (error) {
      toast.error('Lỗi khi xử lý trailer')
      onResetDetection('trailer')
    } finally {
      setIsCheckingTrailer(false)
    }
  }

  const clearLogo = () => {
    setLogoPreview('')
    setLogoFile(null)
    form.setValue('logoUrl', '')
    onResetDetection('logo')
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  const clearBanner = () => {
    setBannerPreview('')
    setBannerFile(null)
    form.setValue('bannerUrl', '')
    onResetDetection('banner')
    if (bannerInputRef.current) bannerInputRef.current.value = ''
  }

  const clearTrailer = () => {
    setTrailerPreview('')
    setTrailerFile(null)
    form.setValue('trailerUrl', '')
    onResetDetection('trailer')
    if (trailerInputRef.current) trailerInputRef.current.value = ''
  }

  const renderDetectionStatus = (detection: MediaDetectionResult | null, file: File | null, isChecking: boolean) => {
    if (!file) return null

    if (isChecking || detection?.isDetecting) {
      return (
        <div className='flex items-center justify-center gap-2 text-blue-600 text-sm mt-3 py-2 bg-blue-50 rounded-lg border border-blue-200'>
          <Loader2 className='w-4 h-4 animate-spin' />
          <span className='font-medium'>Đang kiểm tra nội dung với AI...</span>
        </div>
      )
    }

    if (detection?.detectionResult === null) {
      return (
        <Badge
          variant='outline'
          className='mt-3 w-full justify-center py-2 border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
        >
          <AlertTriangle className='h-3 w-3 mr-1' />
          Chưa kiểm tra AI
        </Badge>
      )
    }

    if (detection?.isSafe) {
      return (
        <Badge
          variant='outline'
          className='mt-3 w-full justify-center py-2 border-green-400 bg-green-50 text-green-700 hover:bg-green-100'
        >
          <CheckCircle2 className='h-3 w-3 mr-1' />
          Nội dung an toàn
        </Badge>
      )
    }

    return (
      <Badge
        variant='outline'
        className='mt-3 w-full justify-center py-2 border-red-400 bg-red-50 text-red-700 hover:bg-red-100'
      >
        <AlertTriangle className='h-3 w-3 mr-1' />
        Nội dung không phù hợp
      </Badge>
    )
  }

  const hasUncheckedFiles = () => {
    const logoNeedsCheck = logoFile && logoDetection?.detectionResult === null
    const bannerNeedsCheck = bannerFile && bannerDetection?.detectionResult === null
    const trailerNeedsCheck = trailerFile && trailerDetection?.detectionResult === null
    return logoNeedsCheck || bannerNeedsCheck || trailerNeedsCheck
  }

  return (
    <div className='space-y-6'>
      {/* Logo Upload */}
      <FormItem>
        <FormLabel className='text-base font-semibold text-slate-700'>Logo sự kiện</FormLabel>
        <FormControl>
          <Card className='p-6 border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors'>
            <input
              ref={logoInputRef}
              type='file'
              accept='image/*'
              onChange={handleLogoChange}
              className='hidden'
              id='logo-upload'
            />

            {logoPreview ? (
              <div className='relative'>
                <img src={logoPreview} alt='Logo' className='w-full h-48 object-contain rounded-lg' />
                <Button
                  type='button'
                  variant='destructive'
                  size='sm'
                  onClick={clearLogo}
                  className='absolute top-2 right-2'
                  disabled={isCheckingLogo}
                >
                  <X className='w-4 h-4' />
                </Button>
                {renderDetectionStatus(logoDetection, logoFile, isCheckingLogo)}
                {logoFile && logoDetection?.detectionResult === null && (
                  <Button
                    type='button'
                    onClick={handleDetectAndUploadLogo}
                    disabled={isCheckingLogo}
                    className='w-full mt-3 bg-blue-600 hover:bg-blue-700'
                  >
                    {isCheckingLogo ? (
                      <>
                        <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                        Đang kiểm tra...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className='w-4 h-4 mr-2' />
                        Kiểm tra AI
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <label htmlFor='logo-upload' className='cursor-pointer block'>
                <div className='flex flex-col items-center justify-center py-8'>
                  <ImageIcon className='w-12 h-12 text-slate-400 mb-4' />
                  <p className='text-sm font-medium text-slate-700'>Click để chọn logo</p>
                  <p className='text-xs text-slate-500 mt-1'>PNG, JPG (tối đa 5MB)</p>
                </div>
              </label>
            )}
          </Card>
        </FormControl>
        <FormDescription>Logo sẽ được kiểm tra bằng AI trước khi tải lên</FormDescription>
      </FormItem>

      {/* Banner Upload */}
      <FormItem>
        <FormLabel className='text-base font-semibold text-slate-700'>Banner sự kiện</FormLabel>
        <FormControl>
          <Card className='p-6 border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors'>
            <input
              ref={bannerInputRef}
              type='file'
              accept='image/*'
              onChange={handleBannerChange}
              className='hidden'
              id='banner-upload'
            />

            {bannerPreview ? (
              <div className='relative'>
                <img src={bannerPreview} alt='Banner' className='w-full h-64 object-cover rounded-lg' />
                <Button
                  type='button'
                  variant='destructive'
                  size='sm'
                  onClick={clearBanner}
                  className='absolute top-2 right-2'
                  disabled={isCheckingBanner}
                >
                  <X className='w-4 h-4' />
                </Button>
                {renderDetectionStatus(bannerDetection, bannerFile, isCheckingBanner)}
                {bannerFile && bannerDetection?.detectionResult === null && (
                  <Button
                    type='button'
                    onClick={handleDetectAndUploadBanner}
                    disabled={isCheckingBanner}
                    className='w-full mt-3 bg-blue-600 hover:bg-blue-700'
                  >
                    {isCheckingBanner ? (
                      <>
                        <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                        Đang kiểm tra...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className='w-4 h-4 mr-2' />
                        Kiểm tra AI
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <label htmlFor='banner-upload' className='cursor-pointer block'>
                <div className='flex flex-col items-center justify-center py-8'>
                  <ImageIcon className='w-12 h-12 text-slate-400 mb-4' />
                  <p className='text-sm font-medium text-slate-700'>Click để chọn banner</p>
                  <p className='text-xs text-slate-500 mt-1'>PNG, JPG (tối đa 10MB)</p>
                </div>
              </label>
            )}
          </Card>
        </FormControl>
        <FormDescription>Banner sẽ được kiểm tra bằng AI trước khi tải lên</FormDescription>
      </FormItem>

      {/* Trailer Upload */}
      <FormItem>
        <FormLabel className='text-base font-semibold text-slate-700'>Video giới thiệu (tùy chọn)</FormLabel>
        <FormControl>
          <Card className='p-6 border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors'>
            <input
              ref={trailerInputRef}
              type='file'
              accept='video/*'
              onChange={handleTrailerChange}
              className='hidden'
              id='trailer-upload'
            />

            {trailerPreview ? (
              <div className='relative'>
                {form.getValues('trailerUrl') && form.getValues('trailerUrl')?.includes('.m3u8') ? (
                  <div className='w-full h-64 rounded-lg overflow-hidden bg-black'>
                    <Suspense fallback={<div className='w-full h-64 bg-slate-200 animate-pulse rounded-lg' />}>
                      <VideoHLSPlayer src={form.getValues('trailerUrl') || ''} classNames='w-full h-full' />
                    </Suspense>
                  </div>
                ) : (
                  <video src={trailerPreview} controls className='w-full h-64 rounded-lg bg-black' />
                )}
                <Button
                  type='button'
                  variant='destructive'
                  size='sm'
                  onClick={clearTrailer}
                  className='absolute top-2 right-2 z-10'
                  disabled={isCheckingTrailer}
                >
                  <X className='w-4 h-4' />
                </Button>
                {renderDetectionStatus(trailerDetection, trailerFile, isCheckingTrailer)}
                {trailerFile && trailerDetection?.detectionResult === null && (
                  <Button
                    type='button'
                    onClick={handleDetectAndUploadTrailer}
                    disabled={isCheckingTrailer}
                    className='w-full mt-3 bg-blue-600 hover:bg-blue-700'
                  >
                    {isCheckingTrailer ? (
                      <>
                        <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                        Đang kiểm tra...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className='w-4 h-4 mr-2' />
                        Kiểm tra AI
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <label htmlFor='trailer-upload' className='cursor-pointer block'>
                <div className='flex flex-col items-center justify-center py-8'>
                  <Video className='w-12 h-12 text-slate-400 mb-4' />
                  <p className='text-sm font-medium text-slate-700'>Click để chọn video</p>
                  <p className='text-xs text-slate-500 mt-1'>MP4, MOV (tối đa 100MB)</p>
                </div>
              </label>
            )}
          </Card>
        </FormControl>
        <FormDescription>Video sẽ được kiểm tra bằng AI và chuyển đổi sang HLS 720p</FormDescription>
      </FormItem>

      {/* Info Dialog if unchecked files exist */}
      {hasUncheckedFiles() && (
        <Card className='p-4 border-2 border-blue-300 bg-blue-50'>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0 mt-0.5'>
              <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center'>
                <Info className='w-5 h-5 text-blue-600' />
              </div>
            </div>
            <div className='flex-1'>
              <h4 className='font-semibold text-blue-900 mb-1'>Kiểm tra AI bắt buộc</h4>
              <p className='text-sm text-blue-800'>
                Bạn cần kiểm tra tất cả file đã chọn bằng AI trước khi tiếp tục sang bước tiếp theo. Hãy nhấn nút{' '}
                <strong>"Kiểm tra AI"</strong> cho từng file.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
