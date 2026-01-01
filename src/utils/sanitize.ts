import DOMPurify from 'dompurify'

/**
 * Input Sanitization Utilities
 * 
 * Provides functions to sanitize user inputs to prevent XSS attacks
 * and ensure data integrity before sending to the backend.
 */

/**
 * Sanitize a string input by removing HTML tags and dangerous characters
 * Use this for text inputs that should not contain HTML
 * 
 * @param input The input string to sanitize
 * @returns Sanitized string with HTML tags removed
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }
  
  // Use DOMPurify to strip HTML tags, then decode HTML entities
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [], // No HTML attributes allowed
    KEEP_CONTENT: true, // Keep the text content but remove tags
  })
  
  // Trim whitespace
  return sanitized.trim()
}

/**
 * Sanitize HTML content (if HTML is actually needed)
 * Use with caution - prefer sanitizeText() for most cases
 * 
 * @param html The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return ''
  }
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
  })
}

/**
 * Sanitize an email address
 * Removes HTML and normalizes whitespace
 * 
 * @param email The email string to sanitize
 * @returns Sanitized email string
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return ''
  }
  
  // Remove HTML tags and trim
  const sanitized = sanitizeText(email)
  
  // Remove any whitespace (emails shouldn't have spaces)
  return sanitized.replace(/\s/g, '').toLowerCase()
}

/**
 * Sanitize a username
 * Allows alphanumeric characters, underscores, hyphens, and spaces
 * 
 * @param username The username string to sanitize
 * @returns Sanitized username string
 */
export function sanitizeUsername(username: string): string {
  if (!username || typeof username !== 'string') {
    return ''
  }
  
  // First strip HTML
  let sanitized = sanitizeText(username)
  
  // Remove any characters that aren't alphanumeric, spaces, underscores, or hyphens
  // This is more permissive - adjust based on your requirements
  sanitized = sanitized.replace(/[^a-zA-Z0-9_\s-]/g, '')
  
  // Normalize whitespace (multiple spaces to single space)
  sanitized = sanitized.replace(/\s+/g, ' ')
  
  return sanitized.trim()
}

/**
 * Sanitize a search query
 * Strips HTML but preserves most characters for search purposes
 * 
 * @param query The search query string
 * @returns Sanitized search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return ''
  }
  
  // Strip HTML tags
  const sanitized = sanitizeText(query)
  
  // Normalize whitespace
  return sanitized.replace(/\s+/g, ' ').trim()
}

/**
 * Escape HTML entities to prevent XSS when using innerHTML
 * Use this when inserting data into HTML strings (template literals)
 * 
 * @param text The text to escape
 * @returns HTML-escaped string
 */
export function escapeHTML(text: string | number | null | undefined): string {
  if (text === null || text === undefined) {
    return ''
  }
  
  const str = String(text)
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  
  return str.replace(/[&<>"']/g, (m) => map[m])
}

