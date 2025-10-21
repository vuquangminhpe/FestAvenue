const removeSpecialCharacter = (str: string) => {
  // eslint-disable-next-line no-useless-escape
  return str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, '')
}
export const generateNameId = ({ name, id, id_2 }: { name: string; id: string; id_2?: string }) => {
  const formattedName = removeSpecialCharacter(name).replace(/\s/g, '-')
  return `${id}-${formattedName}-${id_2}`
}

export const getIdFromNameId = (nameId: string) => {
  return nameId.split('-')[0]
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
