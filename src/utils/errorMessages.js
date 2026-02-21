/**
 * Maps technical API errors to user-friendly messages.
 * Keeps the UI readable and never exposes raw error details to users.
 */

const ERROR_PATTERNS = [
  { test: (msg) => msg.includes('401') || msg.includes('auth'), message: 'API Key invalid or expired. Check your .env file.' },
  { test: (msg) => msg.includes('404'), message: 'Model not found or New API endpoint is not yet available in your region.' },
  { test: (msg) => msg.includes('400'), message: 'Bad request to AI. The input format might be incorrect.' },
  { test: (msg) => msg.includes('API error'), message: (msg) => `AI Server Error: ${msg}` },
  { test: (msg) => msg.includes('503') || msg.includes('loading'), message: 'The AI model is warming up. Please try again in 10 seconds.' },
  { test: (msg) => msg.includes('429') || msg.includes('rate'), message: 'Too many requests. Please wait a moment before trying again.' },
  { test: (msg) => msg.includes('Network') || msg.includes('fetch') || msg.includes('Failed to fetch'), message: 'Connection blocked. Check your internet, or check if a VPN/Firewall is blocking Hugging Face.' },
  { test: (msg) => msg.includes('500') || msg.includes('502'), message: 'The AI service is temporarily unavailable. Please try again later.' },
]

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.'

/**
 * @param {unknown} err - Caught error (Error, string, or other)
 * @returns {string} User-friendly error message
 */
export function toFriendlyErrorMessage(err) {
  if (!err) return FALLBACK_MESSAGE
  const rawMessage = typeof err === 'object' && err?.message ? err.message : String(err)

  for (const { test, message } of ERROR_PATTERNS) {
    if (test(rawMessage)) {
      return typeof message === 'function' ? message(rawMessage) : message
    }
  }
  return FALLBACK_MESSAGE
}
