const removeSpecialCharacter = (str?: string) => {
  // eslint-disable-next-line no-useless-escape
  return str?.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, '')
}
export const generateNameId = ({
  name,
  id,
  id_2,
  templateNumber
}: {
  name: string
  id: string
  id_2?: string
  templateNumber?: number
}) => {
  const formattedName = removeSpecialCharacter(name)?.replace(/\s/g, '-') || ''
  const formattedName_id2 = removeSpecialCharacter(id_2 as string)?.replace(/\s/g, '-') || ''
  const templatePart = templateNumber !== undefined ? `-t${templateNumber}` : ''
  return `${id}-${formattedName}-${formattedName_id2}${templatePart}`
}

export const getIdFromNameId = (nameId: string) => {
  return nameId.split('-')[0]
}

export const getIdFromNameId_ver = (nameId: string) => {
  const parts = nameId.split('-')
  const id = parts[0]
  const templatePart = parts.find((part) => part.startsWith('t'))
  const templateNumber = templatePart ? parseInt(templatePart.substring(1)) : undefined

  return {
    nameId: id,
    nameId_ver: parts[1],
    templateNumber: templateNumber
  }
}
export function formatCurrency(currency: number) {
  return new Intl.NumberFormat('de-DE').format(currency)
}

export function formatNumberToSocialStyle(value: number) {
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumSignificantDigits: 1
  })
    .format(value)
    .replace('.', ',')
}
export function formatTime(date: Date) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

/**
 * Format Date to ISO-like string in local timezone (YYYY-MM-DDTHH:mm:ss)
 * Prevents timezone conversion issues when working with forms
 * @param date - The date to format
 * @returns ISO-like string in local timezone (e.g., "2024-11-04T14:30:00")
 */
export function formatDateToLocalISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

/**
 * Format Date to local ISO string without seconds (YYYY-MM-DDTHH:mm)
 * Useful for datetime-local inputs
 * @param date - The date to convert (assumes local time should be treated as Vietnam time)
 * @returns ISO-like string without seconds (e.g., "2024-11-04T14:30")
 */
export function formatDateToLocalISOShort(date: Date): string {
  return formatDateToLocalISO(date).slice(0, 16)
}

/**
 * Convert a Date to ISO string in UTC
 * Date picker returns local time, and toISOString() automatically converts to UTC
 * @param date - The date to convert (local time from date picker)
 * @returns ISO string in UTC (e.g., "2024-12-17T05:00:00.000Z" for VN time "2024-12-17T12:00:00")
 *
 * Example:
 * - User selects: 17/12/2025 12:00 (Vietnam time)
 * - Browser creates: Date object with local time 12:00
 * - toISOString(): "2025-12-17T05:00:00.000Z" (UTC)
 * - API receives UTC and converts back to VN time correctly
 */
export function toVietnamTimeISO(date: Date): string {
  // Date picker gives us local time (VN timezone in browser)
  // toISOString() automatically converts to UTC
  // No manual offset needed!
  return date.toISOString()
}
