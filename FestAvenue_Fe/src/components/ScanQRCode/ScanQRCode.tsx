'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react'
import {
  Camera,
  ScanLine,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  User,
  Ticket,
  X,
  AlertCircle,
  Mail,
  Hash,
  Calendar
} from 'lucide-react'
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode'
import { useMutation, useQuery } from '@tanstack/react-query'
import serviceSeatManagementApi from '@/apis/serviceSeatManagement.api'
import userApi from '@/apis/user.api'
import type { resCheckInSeat, bodyCheckInSeat } from '@/types/serviceSeatChartManagement'
import type { userRes } from '@/types/user.types'
import { PermissionGuard } from '../guards'
import { Button } from '../ui/button'
import path from '@/constants/path'
import { useNavigate } from 'react-router-dom'

// QR Code format interface
interface QRCodeData {
  eventCode: string
  seatIndex: string
  email: string
}

// Scan result interface
interface ScanResult {
  checkInData: resCheckInSeat
  userData: userRes
}

const TicketVerification: React.FC = () => {
  const navigate = useNavigate()
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [qrScanner, setQrScanner] = useState<Html5Qrcode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [manualInput, setManualInput] = useState({
    eventCode: '',
    seatIndex: '',
    email: ''
  })
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'starting' | 'active' | 'error'>('idle')
  const [lastScannedCode, setLastScannedCode] = useState<string>('')
  const [scanCooldown, setScanCooldown] = useState<number>(0)
  const [currentEmail, setCurrentEmail] = useState<string>('')

  // Mutation for check-in
  const checkInMutation = useMutation({
    mutationFn: (data: bodyCheckInSeat) => serviceSeatManagementApi.CheckInSeat(data),
    onSuccess: (_, variables) => {
      // Success case - get user profile
      setCurrentEmail(variables.email)
      playSound(true)
    },
    onError: (error: any, variables) => {
      // Error case - still get user profile to show info
      const errorData = error?.response?.data
      if (errorData) {
        setError(error?.response?.data)
        setCurrentEmail(variables.email)
        playSound(false)
      } else {
        setError(error?.response?.data?.message || error.message || 'Xác thực thất bại')
        playSound(false)
      }
    }
  })

  // Query for user profile (only enabled when we have email from check-in)
  const { data: userProfileData } = useQuery({
    queryKey: ['userProfile', currentEmail],
    queryFn: () => userApi.getProfileByEmail(currentEmail),
    enabled: !!currentEmail && (checkInMutation.isSuccess || checkInMutation.isError),
    retry: 1
  })

  // Update scan result when we have both check-in response and user profile
  useEffect(() => {
    if (userProfileData?.data && currentEmail) {
      if (checkInMutation.isSuccess && checkInMutation.data) {
        // Success case
        const result: ScanResult = {
          checkInData: checkInMutation.data.data,
          userData: userProfileData.data
        }
        setScanResult(result)
        setManualInput({ eventCode: '', seatIndex: '', email: '' })
        setCurrentEmail('')
      } else if (checkInMutation.isError && checkInMutation.error) {
        // Error case
        const errorData = (checkInMutation.error as any)?.response?.data
        if (errorData && typeof errorData === 'object') {
          const result: ScanResult = {
            checkInData: errorData,
            userData: userProfileData.data
          }
          setScanResult(result)
          setManualInput({ eventCode: '', seatIndex: '', email: '' })
          setCurrentEmail('')
        }
      }
    }
  }, [
    userProfileData,
    currentEmail,
    checkInMutation.isSuccess,
    checkInMutation.isError,
    checkInMutation.data,
    checkInMutation.error
  ])

  // Stop camera và scanner
  const stopCamera = useCallback(async () => {
    if (qrScanner) {
      try {
        const currentState = qrScanner.getState()
        if (currentState === Html5QrcodeScannerState.SCANNING) {
          await qrScanner.stop()
        }
        if (currentState !== Html5QrcodeScannerState.NOT_STARTED) {
          await qrScanner.clear()
        }
        setQrScanner(null)
      } catch (err) {
        console.error('Error stopping scanner:', err)
        setQrScanner(null)
      }
    }

    setIsScanning(false)
    setCameraStatus('idle')
  }, [qrScanner])

  // Cleanup effect
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  // Component mount and cleanup effect
  useEffect(() => {
    console.log('TicketVerification component mounted')

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('Camera không được hỗ trợ trên trình duyệt này')
      setError('Camera không được hỗ trợ trên trình duyệt này')
    }

    return () => {
      console.log('TicketVerification component unmounting')
      stopCamera()
    }
  }, [stopCamera])

  const setupQrScanner = () => {
    const scanner = new Html5Qrcode('qr-reader')
    setQrScanner(scanner)
    return scanner
  }

  const startCamera = async () => {
    try {
      setError(null)
      setCameraStatus('starting')

      await new Promise((resolve) => setTimeout(resolve, 300))

      const element = document.getElementById('qr-reader')
      if (!element) {
        throw new Error('Không tìm thấy phần tử QR reader')
      }

      const scanner = setupQrScanner()
      if (!scanner) return

      const config = {
        fps: 10,
        qrbox: function (viewfinderWidth: number, viewfinderHeight: number) {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight)
          const qrboxSize = Math.floor(minEdge * 0.6)
          return {
            width: qrboxSize,
            height: qrboxSize
          }
        },
        aspectRatio: 1.0,
        rememberLastUsedCamera: true,
        videoConstraints: {
          width: { min: 320, ideal: 640, max: 1280 },
          height: { min: 240, ideal: 480, max: 720 },
          facingMode: 'environment'
        },
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        }
      }

      try {
        const cameras = await Html5Qrcode.getCameras()
        console.log('Available cameras:', cameras)

        const rearCamera = cameras.find(
          (camera) =>
            camera.label.toLowerCase().includes('back') ||
            camera.label.toLowerCase().includes('rear') ||
            camera.label.toLowerCase().includes('environment')
        )

        const cameraId = rearCamera ? rearCamera.id : { facingMode: 'environment' }

        await scanner.start(
          cameraId,
          config,
          (decodedText: string) => {
            if (decodedText && decodedText !== lastScannedCode) {
              console.log('QR Code detected:', decodedText)
              setLastScannedCode(decodedText)
              handleVerifyTicket(decodedText)

              setScanCooldown(20)
              const cooldownInterval = setInterval(() => {
                setScanCooldown((prev) => {
                  if (prev <= 1) {
                    clearInterval(cooldownInterval)
                    setLastScannedCode('')
                    return 0
                  }
                  return prev - 1
                })
              }, 1000)
            }
          },
          () => {
            // Suppress scanning errors
          }
        )
      } catch (err: any) {
        console.log('Rear camera not available, trying front camera...', err)

        try {
          await scanner.start(
            { facingMode: 'user' },
            config,
            (decodedText: string) => {
              if (decodedText && decodedText !== lastScannedCode) {
                console.log('QR Code detected:', decodedText)
                setLastScannedCode(decodedText)
                handleVerifyTicket(decodedText)

                setScanCooldown(20)
                const cooldownInterval = setInterval(() => {
                  setScanCooldown((prev) => {
                    if (prev <= 1) {
                      clearInterval(cooldownInterval)
                      setLastScannedCode('')
                      return 0
                    }
                    return prev - 1
                  })
                }, 1000)
              }
            },
            () => {
              // Suppress scanning errors
            }
          )
        } catch (userCamErr: any) {
          console.log('Front camera also not available', userCamErr)
          throw new Error('Không có camera khả dụng')
        }
      }

      setIsScanning(true)
      setCameraStatus('active')
    } catch (err: any) {
      console.error('Error starting camera:', err)
      setError(`Lỗi camera: ${err.message}`)
      setCameraStatus('error')
      setIsScanning(false)
    }
  }

  // Play sound feedback
  const playSound = (isSuccess: boolean) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      if (isSuccess) {
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1)
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
      } else {
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime + 0.1)
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.2)
      }
    } catch (error) {
      console.log('Audio not supported or error playing sound:', error)
    }
  }

  // Verify ticket code
  const handleVerifyTicket = (qrCodeString: string) => {
    if (!qrCodeString.trim() || checkInMutation.isPending) {
      return
    }

    setError(null)
    setScanResult(null)

    let qrData: QRCodeData
    try {
      qrData = JSON.parse(qrCodeString.trim()) as QRCodeData

      if (!qrData.eventCode || !qrData.seatIndex || !qrData.email) {
        setError('Định dạng QR code không hợp lệ. Thiếu thông tin bắt buộc.')
        playSound(false)
        return
      }
    } catch (parseError) {
      setError('Định dạng QR code không hợp lệ. Yêu cầu JSON với eventCode, seatIndex và email.')
      playSound(false)
      return
    }

    // Trigger check-in mutation
    checkInMutation.mutate({
      eventCode: qrData.eventCode,
      seatIndex: qrData.seatIndex,
      email: qrData.email
    })
  }

  // Handle manual verify
  const handleManualVerify = () => {
    const { eventCode, seatIndex, email } = manualInput
    if (!eventCode || !seatIndex || !email) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }

    const qrCodeString = JSON.stringify({ eventCode, seatIndex, email })
    handleVerifyTicket(qrCodeString)
  }

  // Get verification status
  const getVerificationStatus = () => {
    if (!scanResult) return null

    const { checkInData } = scanResult
    console.log(checkInData, scanResult)

    const isValid = checkInMutation.isSuccess
    const isAlreadyScanned = checkInData.status === 3 && checkInMutation.isError
    const isNotActivated = checkInData.status === 1 && checkInMutation.isError
    const isPaymentIncomplete = !checkInData.isPayment

    if (isAlreadyScanned) {
      return {
        isValid: false,
        icon: XCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        message: 'Vé đã được quét',
        customMessage: `Ghế ${checkInData.seatIndex} đã được check-in`
      }
    }

    if (isNotActivated) {
      return {
        isValid: false,
        icon: AlertTriangle,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        message: 'Vé chưa kích hoạt',
        customMessage: `Ghế ${checkInData.seatIndex} chưa được kích hoạt`
      }
    }

    if (isPaymentIncomplete) {
      return {
        isValid: false,
        icon: XCircle,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        message: 'Thanh toán chưa hoàn tất',
        customMessage: `Thanh toán cho ghế ${checkInData.seatIndex} chưa hoàn tất`
      }
    }

    return {
      isValid,
      icon: isValid ? CheckCircle : XCircle,
      color: isValid ? 'text-green-500' : 'text-red-500',
      bgColor: isValid ? 'bg-green-50' : 'bg-red-50',
      borderColor: isValid ? 'border-green-200' : 'border-red-200',
      message: isValid ? 'Vé hợp lệ - Check-in thành công' : 'Vé không hợp lệ'
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const status = getVerificationStatus()

  return (
    <PermissionGuard
      action='Quét mã vé sự kiện'
      fallback={
        <div className='min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center p-6'>
          <div className='max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center'>
            <div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6'>
              <AlertCircle className='w-10 h-10 text-red-600' />
            </div>
            <h2 className='text-2xl font-bold text-gray-900 mb-3'>Không có quyền truy cập</h2>
            <p className='text-gray-600 mb-6'>
              Bạn không có quyền quét mã vé của sự kiện này. Vui lòng liên hệ quản trị viên để được cấp quyền.
            </p>
            <div className='flex flex-col sm:flex-row gap-3 justify-center'>
              <Button
                variant='outline'
                onClick={() => window.history.back()}
                className='border-gray-300 hover:bg-gray-50'
              >
                Quay lại
              </Button>
              <Button
                className='bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600'
                onClick={() => navigate(path.user.event.root)}
              >
                Về trang sự kiện
              </Button>
            </div>
          </div>
        </div>
      }
    >
      <div className='p-6'>
        <div className='max-w-7xl mx-auto'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2'>
              Quét mã vé sự kiện
            </h1>
            <p className='text-gray-600'>Quét QR code hoặc nhập thông tin thủ công để check-in khách hàng</p>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Camera Scanner Section */}
            <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-6'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center'>
                  <Camera className='h-5 w-5 text-white' />
                </div>
                <h2 className='text-xl font-semibold text-gray-800'>QR Scanner</h2>
              </div>

              {/* Camera View */}
              <div className='relative mb-6'>
                <div className='aspect-video bg-gray-900 rounded-xl overflow-hidden relative border-2 border-gray-200'>
                  <div
                    id='qr-reader'
                    className={`${cameraStatus === 'active' ? 'block' : 'hidden'}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      minHeight: '300px',
                      position: 'relative',
                      backgroundColor: 'transparent'
                    }}
                  />

                  {cameraStatus === 'starting' && (
                    <div className='flex items-center justify-center h-full'>
                      <div className='text-center'>
                        <RefreshCw className='h-16 w-16 text-cyan-500 mx-auto mb-4 animate-spin' />
                        <p className='text-cyan-500 font-medium'>Đang khởi động camera...</p>
                      </div>
                    </div>
                  )}

                  {cameraStatus === 'active' && isScanning && (
                    <div className='absolute inset-0 pointer-events-none z-10'>
                      <div className='absolute inset-4 border-2 border-cyan-400 rounded-lg'>
                        <div className='absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-cyan-400 rounded-tl-lg'></div>
                        <div className='absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-cyan-400 rounded-tr-lg'></div>
                        <div className='absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-cyan-400 rounded-bl-lg'></div>
                        <div className='absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-cyan-400 rounded-br-lg'></div>
                      </div>
                      <ScanLine className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-cyan-400' />
                    </div>
                  )}

                  {(cameraStatus === 'idle' || cameraStatus === 'error') && (
                    <div className='flex items-center justify-center h-full'>
                      <div className='text-center'>
                        <Camera className='h-16 w-16 text-gray-400 mx-auto mb-4' />
                        <p className='text-gray-400'>
                          {cameraStatus === 'error' ? 'Lỗi camera' : 'Camera chưa kích hoạt'}
                        </p>
                        {cameraStatus === 'error' && error && (
                          <p className='text-red-400 text-sm mt-2 max-w-xs mx-auto'>{error}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {scanCooldown > 0 && (
                  <div className='mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center'>
                    <p className='text-yellow-700 text-sm font-medium'>Chờ quét tiếp: {scanCooldown}s</p>
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className='flex gap-3'>
                {cameraStatus === 'idle' || cameraStatus === 'error' ? (
                  <button
                    onClick={startCamera}
                    disabled={false}
                    className='flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl transition-all font-medium shadow-lg'
                  >
                    <Camera className='h-5 w-5' />
                    Bắt đầu quét
                  </button>
                ) : cameraStatus === 'starting' ? (
                  <button
                    disabled
                    className='flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-400 text-white rounded-xl font-medium shadow-lg cursor-not-allowed'
                  >
                    <RefreshCw className='h-5 w-5 animate-spin' />
                    Đang khởi động...
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className='flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors font-medium shadow-lg'
                  >
                    <XCircle className='h-5 w-5' />
                    Dừng quét
                  </button>
                )}

                {(scanResult || error) && (
                  <button
                    onClick={() => {
                      setScanResult(null)
                      setError(null)
                      setLastScannedCode('')
                      setScanCooldown(0)
                    }}
                    className='px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors font-medium shadow-lg'
                  >
                    Xóa
                  </button>
                )}
              </div>

              {/* Manual Input */}
              <div className='mt-6 pt-6 border-t border-gray-200'>
                <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                  <Hash className='h-5 w-5 text-cyan-600' />
                  Nhập thông tin thủ công
                </h3>
                <div className='space-y-3'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      <Calendar className='inline h-4 w-4 mr-1' />
                      Mã sự kiện
                    </label>
                    <input
                      type='text'
                      value={manualInput.eventCode}
                      onChange={(e) => setManualInput({ ...manualInput, eventCode: e.target.value })}
                      placeholder='Nhập mã sự kiện'
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      <Ticket className='inline h-4 w-4 mr-1' />
                      Chỉ số ghế
                    </label>
                    <input
                      type='text'
                      value={manualInput.seatIndex}
                      onChange={(e) => setManualInput({ ...manualInput, seatIndex: e.target.value })}
                      placeholder='Nhập chỉ số ghế (vd: A1)'
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      <Mail className='inline h-4 w-4 mr-1' />
                      Email
                    </label>
                    <input
                      type='email'
                      value={manualInput.email}
                      onChange={(e) => setManualInput({ ...manualInput, email: e.target.value })}
                      placeholder='Nhập email khách hàng'
                      className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent'
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !checkInMutation.isPending) {
                          e.preventDefault()
                          handleManualVerify()
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={handleManualVerify}
                    disabled={checkInMutation.isPending}
                    className='w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-xl transition-all flex items-center justify-center gap-2 font-medium shadow-lg'
                  >
                    {checkInMutation.isPending ? (
                      <RefreshCw className='h-5 w-5 animate-spin' />
                    ) : (
                      <CheckCircle className='h-5 w-5' />
                    )}
                    {checkInMutation.isPending ? 'Đang xác thực...' : 'Xác thực'}
                  </button>
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-6'>
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center'>
                  <Ticket className='h-5 w-5 text-white' />
                </div>
                <h2 className='text-xl font-semibold text-gray-800'>Kết quả xác thực</h2>
              </div>

              {error && (
                <div className='bg-red-50 border border-red-200 rounded-xl p-4 mb-6'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <AlertTriangle className='h-6 w-6 text-red-500' />
                      <div>
                        <h3 className='font-semibold text-red-800'>Xác thực thất bại</h3>
                        <p className='text-red-600 text-sm'>{error}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setError(null)
                        setLastScannedCode('')
                        setScanCooldown(0)
                      }}
                      className='p-2 hover:bg-red-100 rounded-full transition-colors'
                    >
                      <X className='h-5 w-5 text-red-500' />
                    </button>
                  </div>
                </div>
              )}

              {scanResult && status && (
                <div className={`${status.bgColor} ${status.borderColor} border rounded-xl p-6`}>
                  <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center gap-3'>
                      <status.icon className={`h-8 w-8 ${status.color}`} />
                      <div>
                        <h3 className={`text-lg font-semibold ${status.color}`}>{status.message}</h3>
                        {status.customMessage && (
                          <p className='text-red-600 font-medium text-sm'>{status.customMessage}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setScanResult(null)
                        setError(null)
                        setLastScannedCode('')
                        setScanCooldown(0)
                      }}
                      className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                    >
                      <X className='h-5 w-5 text-gray-500' />
                    </button>
                  </div>

                  {/* Customer Information */}
                  <div className='mb-4 p-4 bg-white rounded-lg border'>
                    <h4 className='font-semibold text-gray-800 mb-3 flex items-center gap-2'>
                      <User className='h-5 w-5 text-cyan-600' />
                      Thông tin khách hàng
                    </h4>
                    <div className='flex items-center gap-4'>
                      <img
                        src={scanResult.userData.avatar || '/default-avatar.png'}
                        alt={`${scanResult.userData.firstName} ${scanResult.userData.lastName}`}
                        className='w-16 h-16 rounded-full object-cover border-2 border-gray-200'
                      />
                      <div>
                        <p className='font-medium text-gray-800'>
                          {scanResult.userData.firstName} {scanResult.userData.lastName}
                        </p>
                        <p className='text-sm text-gray-600'>{scanResult.userData.email}</p>
                        {scanResult.userData.phone && (
                          <p className='text-sm text-gray-600'>{scanResult.userData.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Check-In Details */}
                  <div className='mb-4 p-4 bg-white rounded-lg border'>
                    <h4 className='font-semibold text-gray-800 mb-3'>Chi tiết check-in</h4>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <p className='text-sm text-gray-600'>Vị trí ghế</p>
                        <p className='font-medium text-gray-800'>{scanResult.checkInData.seatIndex}</p>
                      </div>
                      <div>
                        <p className='text-sm text-gray-600'>Giá vé</p>
                        <p className='font-medium text-gray-800'>
                          {scanResult.checkInData.seatPrice.toLocaleString('vi-VN')} VND
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Information */}
                  <div className='p-4 bg-white rounded-lg border'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <p className='text-sm text-gray-600'>Trạng thái</p>
                        <p
                          className={`font-medium ${
                            scanResult.checkInData.status === 2
                              ? 'text-green-600'
                              : scanResult.checkInData.status === 3
                              ? 'text-blue-600'
                              : 'text-yellow-600'
                          }`}
                        >
                          {scanResult.checkInData.status === 1
                            ? 'Chưa kích hoạt'
                            : scanResult.checkInData.status === 2
                            ? 'Có thể quét'
                            : 'Đã quét'}
                        </p>
                      </div>
                      <div>
                        <p className='text-sm text-gray-600'>Thanh toán</p>
                        <p
                          className={`font-medium ${
                            scanResult.checkInData.isPayment ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {scanResult.checkInData.isPayment ? 'Hoàn tất' : 'Chưa thanh toán'}
                        </p>
                      </div>
                    </div>
                    {scanResult.checkInData.paymentTime && (
                      <div className='mt-3 pt-3 border-t'>
                        <p className='text-sm text-gray-600'>Thời gian thanh toán</p>
                        <p className='font-medium text-gray-800'>{formatDate(scanResult.checkInData.paymentTime)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!scanResult && !error && (
                <div className='text-center py-12'>
                  <ScanLine className='h-16 w-16 text-gray-300 mx-auto mb-4' />
                  <p className='text-gray-400'>Quét QR code hoặc nhập thông tin để bắt đầu xác thực</p>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className='mt-8 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl p-6'>
            <div className='flex items-start gap-3'>
              <AlertTriangle className='h-6 w-6 text-cyan-600 mt-1' />
              <div>
                <h3 className='font-semibold text-cyan-800 mb-3'>Hướng dẫn check-in</h3>
                <ul className='text-cyan-700 text-sm space-y-2'>
                  <li className='flex items-start gap-2'>
                    <CheckCircle className='h-4 w-4 mt-0.5 text-green-600' />
                    <span>
                      <strong>Xanh lá:</strong> Vé hợp lệ - Cho phép vào
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <XCircle className='h-4 w-4 mt-0.5 text-red-600' />
                    <span>
                      <strong>Đỏ:</strong> Vé đã được quét - Từ chối
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <AlertTriangle className='h-4 w-4 mt-0.5 text-yellow-600' />
                    <span>
                      <strong>Vàng:</strong> Vé chưa kích hoạt - Từ chối
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <XCircle className='h-4 w-4 mt-0.5 text-orange-600' />
                    <span>
                      <strong>Cam:</strong> Chưa thanh toán - Từ chối
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Custom CSS */}
        <style>{`
          #qr-reader video {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            display: block !important;
            border-radius: 12px;
            background: #000;
          }

          #qr-reader canvas {
            display: none !important;
          }

          #qr-reader > div {
            position: relative !important;
            width: 100% !important;
            height: 100% !important;
            min-height: 300px !important;
          }

          #qr-reader {
            min-height: 300px !important;
            background: #1a1a1a;
            border-radius: 12px;
          }
        `}</style>
      </div>
    </PermissionGuard>
  )
}

export default TicketVerification
