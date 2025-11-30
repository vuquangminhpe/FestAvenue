/**
 * Utility functions for schedule validation
 * Provides strong validation for title, description and other fields
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validate schedule title with strict rules
 */
export const validateScheduleTitle = (title: string): ValidationResult => {
  // Remove leading/trailing spaces for validation
  const trimmed = title.trim()

  // Check if empty after trim
  if (!trimmed) {
    return {
      isValid: false,
      error: 'Tiêu đề không được để trống hoặc chỉ chứa khoảng trắng'
    }
  }

  // Check minimum length (after trim)
  if (trimmed.length < 3) {
    return {
      isValid: false,
      error: 'Tiêu đề phải có ít nhất 3 ký tự (không tính khoảng trắng đầu cuối)'
    }
  }

  // Check maximum length
  if (title.length > 200) {
    return {
      isValid: false,
      error: 'Tiêu đề không được vượt quá 200 ký tự'
    }
  }

  // Must start with a letter (Vietnamese or English)
  const firstChar = trimmed[0]
  if (!/[a-zA-ZàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]/.test(firstChar)) {
    return {
      isValid: false,
      error: 'Tiêu đề phải bắt đầu bằng chữ cái, không được bắt đầu bằng số hoặc ký tự đặc biệt'
    }
  }

  // Must contain at least one letter (not just numbers)
  if (!/[a-zA-ZàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]/.test(trimmed)) {
    return {
      isValid: false,
      error: 'Tiêu đề phải chứa ít nhất một chữ cái, không được chỉ toàn số'
    }
  }

  // Check if title has meaningful words (not just repeating characters)
  const withoutSpaces = trimmed.replace(/\s/g, '')

  // Must have at least 2 words for meaningful title
  const words = trimmed.split(/\s+/).filter((w) => w.length > 0)
  if (words.length < 2) {
    return {
      isValid: false,
      error: 'Tiêu đề phải có ít nhất 2 từ (ví dụ: "Họp ban tổ chức", "Chuẩn bị sân khấu")'
    }
  }

  // Check ratio of letters to total characters (at least 50%)
  const letters = trimmed.match(/[a-zA-ZàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]/g) || []
  const totalChars = withoutSpaces.length
  if (totalChars > 0 && letters.length / totalChars < 0.5) {
    return {
      isValid: false,
      error: 'Tiêu đề phải chứa nhiều chữ cái hơn (ít nhất 50% là chữ cái)'
    }
  }

  return { isValid: true }
}

/**
 * Validate schedule description
 */
export const validateScheduleDescription = (description: string | undefined): ValidationResult => {
  if (!description) return { isValid: true } // Optional field

  const trimmed = description.trim()

  // Check maximum length
  if (description.length > 1000) {
    return {
      isValid: false,
      error: 'Mô tả không được vượt quá 1000 ký tự'
    }
  }

  // If user provides description, it should be meaningful
  if (trimmed.length > 0 && trimmed.length < 5) {
    return {
      isValid: false,
      error: 'Mô tả phải có ít nhất 5 ký tự nếu bạn muốn nhập'
    }
  }

  // Must start with a letter if not empty
  if (trimmed.length > 0) {
    const firstChar = trimmed[0]
    if (!/[a-zA-ZàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]/.test(firstChar)) {
      return {
        isValid: false,
        error: 'Mô tả phải bắt đầu bằng chữ cái, không được bắt đầu bằng số'
      }
    }

    // Check for meaningful content (at least 40% letters)
    const letters = trimmed.match(/[a-zA-ZàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđĐ]/g) || []
    const totalChars = trimmed.replace(/\s/g, '').length
    if (totalChars > 0 && letters.length / totalChars < 0.4) {
      return {
        isValid: false,
        error: 'Mô tả phải chứa nội dung có ý nghĩa, không được chỉ là số hoặc ký tự đặc biệt'
      }
    }

    // Check for repeating patterns
    const withoutSpaces = trimmed.replace(/\s/g, '')
    const uniqueChars = new Set(withoutSpaces.toLowerCase())
    if (withoutSpaces.length > 10 && uniqueChars.size < 5) {
      return {
        isValid: false,
        error: 'Mô tả phải có nội dung đa dạng, không được lặp lại ký tự'
      }
    }
  }

  return { isValid: true }
}

/**
 * Sanitize title by trimming and normalizing spaces
 */
export const sanitizeTitle = (title: string): string => {
  return title.trim().replace(/\s+/g, ' ')
}

/**
 * Sanitize description
 */
export const sanitizeDescription = (description: string | undefined): string => {
  if (!description) return ''
  return description.trim().replace(/\s+/g, ' ')
}
