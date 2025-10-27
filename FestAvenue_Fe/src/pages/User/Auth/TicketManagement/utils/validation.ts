// Ticket form validation utilities

export interface ValidationError {
  field: string
  message: string
}

export interface TicketFormData {
  name: string
  description: string
  price: string
  quantity: string
  benefits: string[]
  isFree: boolean
  isPublic: boolean
  startSaleDate: string
  endSaleDate: string
}

export interface EventConstraints {
  lifecycleStart: Date
  lifecycleEnd: Date
  capacity: number
}

export function validateTicketName(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return 'Tên vé không được để trống'
  }
  if (name.trim().length < 3) {
    return 'Tên vé phải có ít nhất 3 ký tự'
  }
  if (name.length > 100) {
    return 'Tên vé không được vượt quá 100 ký tự'
  }
  // Check special characters
  const invalidChars = /[<>{}[\]\\\/]/
  if (invalidChars.test(name)) {
    return 'Tên vé không được chứa ký tự đặc biệt không hợp lệ'
  }
  return null
}

export function validateDescription(description: string): string | null {
  if (!description || description.trim().length === 0) {
    return 'Mô tả không được để trống'
  }
  if (description.trim().length < 10) {
    return 'Mô tả phải có ít nhất 10 ký tự'
  }
  if (description.length > 500) {
    return 'Mô tả không được vượt quá 500 ký tự'
  }
  return null
}

export function validatePrice(price: string, isFree: boolean): string | null {
  if (isFree) return null // Skip price validation for free tickets

  if (!price || price.trim() === '') {
    return 'Giá vé không được để trống'
  }

  const priceNumber = Number(price)

  if (isNaN(priceNumber)) {
    return 'Giá vé phải là số hợp lệ'
  }

  if (priceNumber < 0) {
    return 'Giá vé không được âm'
  }

  if (priceNumber === 0) {
    return 'Giá vé phải lớn hơn 0 (hoặc chọn vé miễn phí)'
  }

  if (priceNumber > 100000000) {
    return 'Giá vé không được vượt quá 100,000,000 VND'
  }

  // Check if price is multiple of 1000
  if (priceNumber % 1000 !== 0) {
    return 'Giá vé phải là bội số của 1,000 VND'
  }

  return null
}

export function validateQuantity(quantity: string, eventCapacity?: number): string | null {
  if (!quantity || quantity.trim() === '') {
    return 'Số lượng vé không được để trống'
  }

  const quantityNumber = Number(quantity)

  if (isNaN(quantityNumber)) {
    return 'Số lượng vé phải là số hợp lệ'
  }

  if (!Number.isInteger(quantityNumber)) {
    return 'Số lượng vé phải là số nguyên'
  }

  if (quantityNumber < 1) {
    return 'Số lượng vé phải lớn hơn 0'
  }

  if (eventCapacity !== undefined && quantityNumber > eventCapacity) {
    return `Số lượng vé không được vượt quá sức chứa sự kiện (${eventCapacity.toLocaleString('vi-VN')})`
  }

  if (quantityNumber > 1000000) {
    return 'Số lượng vé không được vượt quá 1,000,000'
  }

  return null
}

export function validateSaleDates(
  startSaleDate: string,
  endSaleDate: string,
  eventConstraints?: EventConstraints
): ValidationError[] {
  const errors: ValidationError[] = []

  if (!startSaleDate) {
    errors.push({ field: 'startSaleDate', message: 'Ngày bắt đầu bán không được để trống' })
  }

  if (!endSaleDate) {
    errors.push({ field: 'endSaleDate', message: 'Ngày kết thúc bán không được để trống' })
  }

  if (!startSaleDate || !endSaleDate) {
    return errors
  }

  const startDate = new Date(startSaleDate)
  const endDate = new Date(endSaleDate)

  // Check if dates are valid
  if (isNaN(startDate.getTime())) {
    errors.push({ field: 'startSaleDate', message: 'Ngày bắt đầu không hợp lệ' })
  }

  if (isNaN(endDate.getTime())) {
    errors.push({ field: 'endSaleDate', message: 'Ngày kết thúc không hợp lệ' })
  }

  if (errors.length > 0) return errors

  // Check if start date is in the past (only for new tickets, allow for updates)
  // if (startDate < now) {
  //   errors.push({ field: 'startSaleDate', message: 'Ngày bắt đầu bán không được trong quá khứ' })
  // }

  // Check if end date is after start date
  if (endDate <= startDate) {
    errors.push({ field: 'endSaleDate', message: 'Ngày kết thúc bán phải sau ngày bắt đầu' })
  }

  // Check minimum duration (at least 1 hour)
  const durationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
  if (durationHours < 1) {
    errors.push({ field: 'endSaleDate', message: 'Thời gian bán vé phải ít nhất 1 giờ' })
  }

  // Check if dates are within event lifecycle
  if (eventConstraints) {
    const { lifecycleStart, lifecycleEnd } = eventConstraints

    // Normalize dates to compare only day
    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
    const lifecycleStartDay = new Date(
      lifecycleStart.getFullYear(),
      lifecycleStart.getMonth(),
      lifecycleStart.getDate()
    )
    const lifecycleEndDay = new Date(lifecycleEnd.getFullYear(), lifecycleEnd.getMonth(), lifecycleEnd.getDate())

    if (startDay < lifecycleStartDay) {
      errors.push({
        field: 'startSaleDate',
        message: `Ngày bắt đầu bán phải sau hoặc bằng ngày bắt đầu sự kiện (${lifecycleStart.toLocaleDateString(
          'vi-VN'
        )})`
      })
    }

    if (endDay > lifecycleEndDay) {
      errors.push({
        field: 'endSaleDate',
        message: `Ngày kết thúc bán phải trước hoặc bằng ngày kết thúc sự kiện (${lifecycleEnd.toLocaleDateString(
          'vi-VN'
        )})`
      })
    }
  }

  return errors
}

export function validateBenefits(benefits: string[]): string | null {
  if (benefits.length > 10) {
    return 'Số lượng quyền lợi không được vượt quá 10'
  }

  for (const benefit of benefits) {
    if (benefit.trim().length === 0) {
      return 'Quyền lợi không được để trống'
    }
    if (benefit.length > 100) {
      return 'Mỗi quyền lợi không được vượt quá 100 ký tự'
    }
  }

  // Check for duplicates
  const uniqueBenefits = new Set(benefits.map((b) => b.trim().toLowerCase()))
  if (uniqueBenefits.size !== benefits.length) {
    return 'Không được có quyền lợi trùng lặp'
  }

  return null
}

export function validateTicketForm(
  formData: TicketFormData,
  eventConstraints?: EventConstraints
): Record<string, string> {
  const errors: Record<string, string> = {}

  // Validate name
  const nameError = validateTicketName(formData.name)
  if (nameError) errors.name = nameError

  // Validate description
  const descError = validateDescription(formData.description)
  if (descError) errors.description = descError

  // Validate price
  const priceError = validatePrice(formData.price, formData.isFree)
  if (priceError) errors.price = priceError

  // Validate quantity
  const quantityError = validateQuantity(formData.quantity, eventConstraints?.capacity)
  if (quantityError) errors.quantity = quantityError

  // Validate sale dates
  const dateErrors = validateSaleDates(formData.startSaleDate, formData.endSaleDate, eventConstraints)
  dateErrors.forEach((error) => {
    errors[error.field] = error.message
  })

  // Validate benefits
  const benefitsError = validateBenefits(formData.benefits)
  if (benefitsError) errors.benefits = benefitsError

  return errors
}

export function sanitizeTicketName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

export function sanitizeDescription(description: string): string {
  return description.trim().replace(/\s+/g, ' ')
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price)
}
