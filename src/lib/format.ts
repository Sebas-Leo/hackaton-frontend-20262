const berries = new Intl.NumberFormat('es-PE')
const dateTime = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' })

export function formatBerries(amount: number): string {
  return `฿ ${berries.format(amount)}`
}

export function formatNumber(value: number): string {
  return berries.format(value)
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : dateTime.format(date)
}
