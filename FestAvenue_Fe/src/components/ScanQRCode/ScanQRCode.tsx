'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import '@undecaf/barcode-detector-polyfill'
import React, { useState, useEffect } from 'react'
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
  Calendar,
  Zap,
  ZapOff
} from 'lucide-react'
import { Scanner, useDevices } from '@yudiel/react-qr-scanner'
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
  const devices = useDevices()
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  // 🔍 LOG: Component mount and API support check
  useEffect(() => {
    console.log('🚀 [SCANNER] Component mounted')
    console.log('🌐 [SCANNER] User Agent:', navigator.userAgent)
    console.log('🔍 [SCANNER] BarcodeDetector supported:', 'BarcodeDetector' in window)

    if ('BarcodeDetector' in window) {
      console.log('✅ [SCANNER] Native Barcode Detection API available')
      // @ts-ignore
      BarcodeDetector.getSupportedFormats().catch((err: Error) => {
        console.error('❌ [SCANNER] Error getting supported formats:', err)
      })
    } else {
      console.warn('⚠️ [SCANNER] Native Barcode Detection API NOT available - library may use polyfill')
    }

    // Check camera permissions
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      console.log('✅ [SCANNER] getUserMedia API available')
    } else {
      console.error('❌ [SCANNER] getUserMedia API NOT available')
    }
  }, [])

  // 🔍 LOG: Devices detection
  useEffect(() => {
    console.log('📷 [SCANNER] Devices detected:', devices)
    console.log('📷 [SCANNER] Number of devices:', devices?.length || 0)
    if (devices && devices.length > 0) {
      devices.forEach((device, index) => {
        console.log(`📷 [SCANNER] Device ${index + 1}:`, {
          deviceId: device.deviceId,
          label: device.label,
          kind: device.kind
        })
      })
    }
  }, [devices])
  const [manualInput, setManualInput] = useState({
    eventCode: '',
    seatIndex: '',
    email: ''
  })
  const [lastScannedCode, setLastScannedCode] = useState<string>('')
  const [scanCooldown, setScanCooldown] = useState<number>(0)
  const [currentEmail, setCurrentEmail] = useState<string>('')
  const [torchEnabled, setTorchEnabled] = useState(false)
  const [lastScanTime, setLastScanTime] = useState<number>(0)

  // Mutation for check-in
  const checkInMutation = useMutation({
    mutationFn: (data: bodyCheckInSeat) => {
      console.log('🔄 [API] Calling CheckInSeat API with:', data)
      return serviceSeatManagementApi.CheckInSeat(data)
    },
    onSuccess: (response, variables) => {
      console.log('✅ [API] Check-in SUCCESS:', response)
      console.log('✅ [API] Variables:', variables)
      // Success case - get user profile
      setCurrentEmail(variables.email)
      playSound(true)
    },
    onError: (error: any, variables) => {
      console.error('❌ [API] Check-in ERROR:', error)
      console.error('❌ [API] Error response:', error?.response?.data)
      console.error('❌ [API] Variables:', variables)
      setCurrentEmail(variables.email)
      playSound(false)

      setError(error?.response?.data?.message || error.message || 'Xác thực thất bại')
      playSound(false)
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

  // 🔍 LOG: Scanning state changes
  useEffect(() => {
    console.log('🎥 [SCANNER] Scanning state changed:', isScanning)
    if (isScanning) {
      console.log('🎥 [SCANNER] Selected device:', selectedDevice || 'Default (rear camera)')
      console.log('🎥 [SCANNER] Torch enabled:', torchEnabled)
    }
  }, [isScanning, selectedDevice, torchEnabled])

  // Handle QR code scan
  const handleScan = (detectedCodes: any[]) => {
    console.log('🔍 [SCAN] handleScan called with:', detectedCodes)

    if (!detectedCodes || detectedCodes.length === 0) {
      console.log('⚠️ [SCAN] No codes detected')
      return
    }

    const qrCodeString = detectedCodes[0].rawValue
    const now = Date.now()

    console.log('✅ [SCAN] QR Code detected:', qrCodeString)
    console.log('🕐 [SCAN] Last scan time:', lastScanTime, 'Current:', now, 'Diff:', now - lastScanTime)

    // Prevent duplicate scans within 2 seconds (less restrictive than before)
    if (qrCodeString === lastScannedCode && now - lastScanTime < 2000) {
      console.log('⏸️ [SCAN] Duplicate scan blocked (within 2s)')
      return
    }

    // Don't scan if already processing
    if (checkInMutation.isPending) {
      console.log('⏸️ [SCAN] Check-in already pending, blocking scan')
      return
    }

    console.log('✅ [SCAN] Proceeding with verification')
    setLastScannedCode(qrCodeString)
    setLastScanTime(now)
    handleVerifyTicket(qrCodeString)

    // Set short cooldown
    setScanCooldown(2)
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

  // Handle scan error
  const handleScanError = (error: any) => {
    console.error('❌ [SCANNER] Scan error:', error)
    console.error('❌ [SCANNER] Error type:', error?.name)
    console.error('❌ [SCANNER] Error message:', error?.message)
    // Don't show error for normal scanning failures, only critical errors
  }

  // Verify ticket code
  const handleVerifyTicket = (qrCodeString: string) => {
    console.log('🎫 [VERIFY] Starting ticket verification')
    console.log('🎫 [VERIFY] QR String:', qrCodeString)

    if (!qrCodeString.trim() || checkInMutation.isPending) {
      console.log('⚠️ [VERIFY] Verification blocked - empty string or pending mutation')
      return
    }

    setError(null)
    setScanResult(null)

    let qrData: QRCodeData
    try {
      console.log('🔄 [VERIFY] Parsing QR code JSON...')
      qrData = JSON.parse(qrCodeString.trim()) as QRCodeData
      console.log('✅ [VERIFY] Parsed QR data:', qrData)

      if (!qrData.eventCode || !qrData.seatIndex || !qrData.email) {
        console.error('❌ [VERIFY] Missing required fields:', {
          hasEventCode: !!qrData.eventCode,
          hasSeatIndex: !!qrData.seatIndex,
          hasEmail: !!qrData.email
        })
        setError('Định dạng QR code không hợp lệ. Thiếu thông tin bắt buộc.')
        playSound(false)
        return
      }
    } catch (parseError) {
      console.error('❌ [VERIFY] JSON parse error:', parseError)
      console.error('❌ [VERIFY] Raw QR string:', qrCodeString)
      setError('Định dạng QR code không hợp lệ. Yêu cầu JSON với eventCode, seatIndex và email.')
      playSound(false)
      return
    }

    // Trigger check-in mutation
    console.log('🚀 [VERIFY] Triggering check-in mutation with data:', qrData)
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

              {/* Camera Selection */}
              {devices && devices.length > 1 && (
                <div className='mb-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
                    <Camera className='w-4 h-4 text-cyan-600' />
                    Chọn camera
                  </label>
                  <select
                    value={selectedDevice}
                    onChange={(e) => setSelectedDevice(e.target.value)}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white'
                  >
                    <option value=''>Camera mặc định (Sau)</option>
                    {devices.map((device) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${device.deviceId.substring(0, 8)}...`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Camera View */}
              <div className='relative mb-6'>
                <div className='aspect-video bg-gray-900 rounded-xl overflow-hidden relative border-2 border-gray-200'>
                  {isScanning ? (
                    <div className='w-full h-full'>
                      <Scanner
                        onScan={(result) => {
                          console.log('📸 [SCANNER] onScan triggered!', result)
                          handleScan(result)
                        }}
                        onError={handleScanError}
                        formats={['qr_code']}
                        scanDelay={500}
                        constraints={selectedDevice ? { deviceId: selectedDevice } : { facingMode: 'environment' }}
                        styles={{
                          container: {
                            width: '100%',
                            height: '100%',
                            position: 'relative'
                          },
                          video: {
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }
                        }}
                        components={{
                          finder: true,
                          torch: torchEnabled
                        }}
                      />
                    </div>
                  ) : (
                    <div className='flex items-center justify-center h-full'>
                      <div className='text-center'>
                        <Camera className='h-16 w-16 text-gray-400 mx-auto mb-4' />
                        <p className='text-gray-400'>Camera chưa kích hoạt</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Scanning Status */}
                {isScanning && (
                  <div className='mt-3 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-3'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
                        <p className='text-cyan-700 text-sm font-medium'>
                          {scanCooldown > 0
                            ? `Chờ ${scanCooldown}s để quét tiếp`
                            : 'Đang quét - Giữ QR code trong khung hình'}
                        </p>
                      </div>
                      <button
                        onClick={() => setTorchEnabled(!torchEnabled)}
                        className={`p-2 rounded-lg transition-colors ${
                          torchEnabled
                            ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-500'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        title={torchEnabled ? 'Tắt đèn flash' : 'Bật đèn flash'}
                      >
                        {torchEnabled ? <Zap className='w-4 h-4' /> : <ZapOff className='w-4 h-4' />}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className='flex gap-3'>
                {!isScanning ? (
                  <button
                    onClick={() => {
                      setIsScanning(true)
                      setError(null)
                    }}
                    className='flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-xl transition-all font-medium shadow-lg'
                  >
                    <Camera className='h-5 w-5' />
                    Bắt đầu quét
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsScanning(false)
                      setLastScannedCode('')
                      setScanCooldown(0)
                    }}
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
          <div className='mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Check-in Status Guide */}
            <div className='bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl p-6'>
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

            {/* Scanning Tips */}
            <div className='bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6'>
              <div className='flex items-start gap-3'>
                <Camera className='h-6 w-6 text-purple-600 mt-1' />
                <div>
                  <h3 className='font-semibold text-purple-800 mb-3'>Mẹo quét nhanh</h3>
                  <ul className='text-purple-700 text-sm space-y-2'>
                    <li className='flex items-start gap-2'>
                      <ScanLine className='h-4 w-4 mt-0.5 text-purple-600' />
                      <span>Giữ QR code cách camera 15-30cm</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <Zap className='h-4 w-4 mt-0.5 text-yellow-600' />
                      <span>Bật đèn flash nếu ánh sáng yếu</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <CheckCircle className='h-4 w-4 mt-0.5 text-green-600' />
                      <span>Đảm bảo QR code không bị mờ hay nhăn</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <RefreshCw className='h-4 w-4 mt-0.5 text-blue-600' />
                      <span>Quét tự động - không cần nhấn nút</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PermissionGuard>
  )
}

export default TicketVerification
