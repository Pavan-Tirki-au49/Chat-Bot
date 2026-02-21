/**
 * Hugging Face Inference API
 *
 * Format: https://api-inference.huggingface.co/models/{model_id}
 * Headers: Authorization: Bearer <token>, Content-Type: application/json
 *
 * API KEY USAGE (industry standard):
 * - Load once from environment at first use.
 * - Reuse the same key for all chat messages in the session.
 * - Never regenerate or fetch a new key per message.
 *
 * Why per-message key generation is incorrect:
 * - API keys are static credentials issued once, not dynamically generated per request.
 * - "Regenerating" would mean calling a key service or re-reading env on every message,
 *   which adds latency, can hit rate limits, and is unnecessary.
 * - Industry practice: read from config/env once, cache in memory, reuse for the lifetime
 *   of the app or session.
 */

const API_BASE = 'https://router.huggingface.co/v1/chat/completions'
const DEFAULT_CHAT_MODEL = 'meta-llama/Llama-3.2-1B-Instruct'

const API_KEY_WARNING =
  '[Hugging Face] API key missing. Add VITE_HUGGINGFACE_API_KEY to your .env file. Request will fail.'

/** Session key: loaded once from env, reused for all requests. Never refreshed per message. */
let sessionApiKey = /** @type {string | null} */ (null)

/**
 * Returns true if the API key is configured (non-empty string).
 */
export function isApiKeyConfigured() {
  const key = import.meta.env.VITE_HUGGINGFACE_API_KEY
  return typeof key === 'string' && key.trim().length > 0 && !key.includes('your_actual_huggingface_api_key')
}

/**
 * Returns the API key for the session.
 */
function getApiKey(override) {
  if (override && override.trim()) return override.trim()
  if (sessionApiKey) return sessionApiKey

  const key = import.meta.env.VITE_HUGGINGFACE_API_KEY
  if (typeof key !== 'string' || !key.trim() || key.includes('your_actual_huggingface_api_key')) {
    throw new Error('Hugging Face API key is missing or is still the placeholder.')
  }

  sessionApiKey = key.trim()
  return sessionApiKey
}

/**
 * Sends a conversational message using the OpenAI-compatible endpoint.
 */
export async function sendChatMessage(
  message,
  apiKey,
  model = DEFAULT_CHAT_MODEL,
  history = {}
) {
  const key = getApiKey(apiKey)

  // Format messages for OpenAI style
  const messages = []
  const pastUserInputs = history.pastUserInputs ?? []
  const generatedResponses = history.generatedResponses ?? []

  for (let i = 0; i < pastUserInputs.length; i++) {
    messages.push({ role: 'user', content: pastUserInputs[i] })
    if (generatedResponses[i]) {
      messages.push({ role: 'assistant', content: generatedResponses[i] })
    }
  }
  messages.push({ role: 'user', content: message })

  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      max_tokens: 500,
      stream: false
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`API error ${response.status}: ${body || response.statusText}`)
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content ?? ''

  return { text: text || 'No response generated.' }
}

const DEFAULT_TEXT_MODEL = 'gpt2'

/**
 * Builds request headers.
 */
function buildRequestHeaders(apiKey) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  }
}

/**
 * Diagnostic tool to check if the network is actually reachable.
 */
export async function testConnectivity() {
  try {
    // Try to fetch a neutral, highly available image to test basic internet
    const response = await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' })
    return { status: 'ok', message: 'Basic internet check passed.' }
  } catch (err) {
    return { status: 'blocked', message: 'Internet request failed. Your browser/network is blocking outbound requests.' }
  }
}

/**
 * Simple text generation (no conversation context).
 */
export async function generateText(prompt, apiKey, model = DEFAULT_TEXT_MODEL) {
  const key = getApiKey(apiKey)
  const endpoint = 'https://router.huggingface.co/v1/chat/completions'

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: buildRequestHeaders(key),
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      stream: false
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`API error ${response.status}: ${body || response.statusText}`)
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content ?? ''
  return { text }
}
