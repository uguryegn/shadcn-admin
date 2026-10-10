/**
 * Cookie utility functions using manual document.cookie approach
 * Replaces js-cookie dependency for better consistency
 */

const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined

  let cookies: string
  try {
    cookies = document.cookie
  } catch {
    // Sandboxed frames (e.g. hosted previews) may block cookie access.
    return undefined
  }

  const value = `; ${cookies}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift()
    return cookieValue
  }
  return undefined
}

/**
 * Set a cookie with name, value, and optional max age
 */
export function setCookie(
  name: string,
  value: string,
  maxAge: number = DEFAULT_MAX_AGE
): void {
  if (typeof document === 'undefined') return

  try {
    document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`
  } catch {
    // Ignore: cookies unavailable in sandboxed frames.
  }
}

/**
 * Remove a cookie by setting its max age to 0
 */
export function removeCookie(name: string): void {
  if (typeof document === 'undefined') return

  try {
    document.cookie = `${name}=; path=/; max-age=0`
  } catch {
    // Ignore: cookies unavailable in sandboxed frames.
  }
}
