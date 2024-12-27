export function isEmpty(value: any): boolean {
  if (value == null) return true // null or undefined
  if (typeof value === 'boolean') return !value // false
  if (typeof value === 'number') return isNaN(value) || value === 0 // NaN or 0
  if (typeof value === 'string') return value.trim().length === 0 // Empty or whitespace-only string
  if (Array.isArray(value)) return value.length === 0 // Empty array
  if (typeof value === 'object') return Object.keys(value).length === 0 // Empty object
  return false // For all other cases
}
