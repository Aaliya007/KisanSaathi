import { fallbackDiagnosis } from './fallbackDiagnosis'

const API_BASE_URL = 'https://web-production-97ab9.up.railway.app'
const REQUEST_TIMEOUT_MS = 30000

export class ApiError extends Error {
  constructor(message, { status, detail } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

async function readJsonResponse(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

function formatBackendDetail(detail) {
  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg)
      .filter(Boolean)
      .join(' ')
  }

  if (typeof detail === 'string') {
    return detail
  }

  return ''
}

function validateChatPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new ApiError('The diagnosis service returned an empty response.')
  }

  return payload
}

function isValidChatResponse(payload) {
  if (!payload || typeof payload !== 'object') {
    return false
  }

  if (payload.status === 'asking') {
    return Boolean(payload.question?.trim())
  }

  return Boolean(payload.diagnosis?.trim() || payload.advice?.trim())
}

function shouldUseFallback(error) {
  if (!(error instanceof ApiError)) {
    return true
  }

  if (!error.status) {
    return true
  }

  if (error.status === 429 || error.status >= 500) {
    return true
  }

  if (error.message.includes('empty response') || error.message.includes('invalid response')) {
    return true
  }

  return false
}

function buildFallbackResponse({ message, imageUploaded, sessionId }) {
  return {
    ...fallbackDiagnosis({ message, imageUploaded }),
    session_id: sessionId,
  }
}

async function withFallbackDiagnosis(apiCall, { message, imageUploaded, sessionId }) {
  try {
    const response = await apiCall()

    if (!isValidChatResponse(response)) {
      return buildFallbackResponse({ message, imageUploaded, sessionId })
    }

    return response
  } catch (error) {
    if (shouldUseFallback(error)) {
      return buildFallbackResponse({ message, imageUploaded, sessionId })
    }

    throw error
  }
}

async function requestJson(path, options) {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new ApiError('The diagnosis service timed out. Please try again.', {
        detail: error,
      })
    }

    throw new ApiError('Unable to reach the diagnosis service. Please check your connection.', {
      detail: error,
    })
  } finally {
    window.clearTimeout(timeoutId)
  }

  const payload = await readJsonResponse(response)

  if (!response.ok) {
    const detail = formatBackendDetail(payload?.detail) || payload?.message
    throw new ApiError(detail || 'The diagnosis service could not process this request.', {
      status: response.status,
      detail: payload?.detail,
    })
  }

  if (payload === null) {
    throw new ApiError('The diagnosis service returned an invalid response.')
  }

  return validateChatPayload(payload)
}

export async function sendText({ sessionId, message, latitude = 0, longitude = 0 }) {
  return withFallbackDiagnosis(
    () =>
      requestJson('/chat/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          message,
          latitude,
          longitude,
        }),
      }),
    { message, imageUploaded: false, sessionId }
  )
}

export async function sendImage({
  sessionId,
  message,
  image,
  latitude = 0,
  longitude = 0,
}) {
  const formData = new FormData()
  formData.append('session_id', sessionId)
  formData.append('message', message)
  formData.append('image', image)
  formData.append('latitude', String(latitude))
  formData.append('longitude', String(longitude))

  return withFallbackDiagnosis(
    () =>
      requestJson('/chat/image', {
        method: 'POST',
        body: formData,
      }),
    { message, imageUploaded: true, sessionId }
  )
}

export async function speak(text) {
  let response

  try {
    response = await fetch(`${API_BASE_URL}/chat/speak`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })
  } catch (error) {
    throw new ApiError('Unable to reach the voice service. Please check your connection.', {
      detail: error,
    })
  }

  if (!response.ok) {
    const payload = await readJsonResponse(response)
    const detail = formatBackendDetail(payload?.detail) || payload?.message

    throw new ApiError(detail || 'The voice service could not generate audio.', {
      status: response.status,
      detail: payload?.detail,
    })
  }

  return response.blob()
}
