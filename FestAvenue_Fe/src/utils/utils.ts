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
