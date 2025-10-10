import { useState } from 'react'
import type { AIDetectRes } from '@/types/AI.types'

export interface MediaDetectionResult {
  url: string
  file: File
  detectionResult: AIDetectRes | null
  isDetecting: boolean
  isSafe: boolean
}

export const useAIDetection = () => {
  const [logoDetection, setLogoDetection] = useState<MediaDetectionResult | null>(null)
  const [bannerDetection, setBannerDetection] = useState<MediaDetectionResult | null>(null)
  const [trailerDetection, setTrailerDetection] = useState<MediaDetectionResult | null>(null)

  // Called when user selects a file (before AI check)
  const setLogoFile = (file: File) => {
    setLogoDetection({
      url: '',
      file,
      detectionResult: null, // Not checked yet
      isDetecting: false,
      isSafe: false
    })
  }

  const setBannerFile = (file: File) => {
    setBannerDetection({
      url: '',
      file,
      detectionResult: null, // Not checked yet
      isDetecting: false,
      isSafe: false
    })
  }

  const setTrailerFile = (file: File) => {
    setTrailerDetection({
      url: '',
      file,
      detectionResult: null, // Not checked yet
      isDetecting: false,
      isSafe: false
    })
  }

  // Called after manual AI check completes
  const detectLogo = async (file: File, url: string, isSafe: boolean = true) => {
    // Store the result after manual detection in MediaUpload
    // isSafe determines if content passed AI check
    // url is only set if both AI check passed AND upload succeeded
    setLogoDetection({
      url,
      file,
      detectionResult: { is_safe: isSafe } as any,
      isDetecting: false,
      isSafe: isSafe
    })

    return isSafe
  }

  const detectBanner = async (file: File, url: string, isSafe: boolean = true) => {
    // Store the result after manual detection in MediaUpload
    // isSafe determines if content passed AI check
    // url is only set if both AI check passed AND upload succeeded
    setBannerDetection({
      url,
      file,
      detectionResult: { is_safe: isSafe } as any,
      isDetecting: false,
      isSafe: isSafe
    })

    return isSafe
  }

  const detectTrailer = async (file: File, url: string, isSafe: boolean = true) => {
    // Store the result after manual detection in MediaUpload
    // isSafe determines if content passed AI check
    // url is only set if both AI check passed AND upload succeeded
    setTrailerDetection({
      url,
      file,
      detectionResult: { is_safe: isSafe } as any,
      isDetecting: false,
      isSafe: isSafe
    })

    return isSafe
  }

  const canProceed = () => {
    // Only check files that were actually uploaded
    // If no file was uploaded for that media type, it's OK (trailer is optional)
    const logoOk = !logoDetection || (logoDetection.detectionResult !== null && logoDetection.isSafe)
    const bannerOk = !bannerDetection || (bannerDetection.detectionResult !== null && bannerDetection.isSafe)
    const trailerOk = !trailerDetection || (trailerDetection.detectionResult !== null && trailerDetection.isSafe)

    console.log('🔍 canProceed check:', {
      logoDetection,
      bannerDetection,
      trailerDetection,
      logoOk,
      bannerOk,
      trailerOk,
      result: logoOk && bannerOk && trailerOk
    })

    return logoOk && bannerOk && trailerOk
  }

  const hasUncheckedFiles = () => {
    // Check if there are uploaded files that haven't been checked yet
    const logoNeedsCheck = logoDetection && logoDetection.detectionResult === null && !logoDetection.isDetecting
    const bannerNeedsCheck = bannerDetection && bannerDetection.detectionResult === null && !bannerDetection.isDetecting
    const trailerNeedsCheck =
      trailerDetection && trailerDetection.detectionResult === null && !trailerDetection.isDetecting

    return logoNeedsCheck || bannerNeedsCheck || trailerNeedsCheck
  }

  const isDetecting = () => {
    return (
      logoDetection?.isDetecting ||
      false ||
      bannerDetection?.isDetecting ||
      false ||
      trailerDetection?.isDetecting ||
      false
    )
  }

  const resetDetection = (type: 'logo' | 'banner' | 'trailer') => {
    switch (type) {
      case 'logo':
        setLogoDetection(null)
        break
      case 'banner':
        setBannerDetection(null)
        break
      case 'trailer':
        setTrailerDetection(null)
        break
    }
  }

  return {
    logoDetection,
    bannerDetection,
    trailerDetection,
    setLogoFile,
    setBannerFile,
    setTrailerFile,
    detectLogo,
    detectBanner,
    detectTrailer,
    canProceed,
    isDetecting,
    hasUncheckedFiles,
    resetDetection
  }
}
