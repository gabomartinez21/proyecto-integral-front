const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api').replace(/\/$/, '')

/** Error devuelto por el backend (o de red), con un mensaje listo para mostrar. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type TokenProvider = () => string | null
type UnauthorizedHandler = () => void

let getToken: TokenProvider = () => null
let onUnauthorized: UnauthorizedHandler = () => {}

/** Lo configura el servicio de auth para no acoplar el cliente al almacenamiento de la sesión. */
export function configureApiAuth(provider: TokenProvider, handler: UnauthorizedHandler) {
  getToken = provider
  onUnauthorized = handler
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  /** JSON (objeto) o formulario (URLSearchParams). */
  body?: unknown
  /** false para endpoints públicos (login, register). */
  auth?: boolean
  /** Token explícito (p. ej. justo después del login, antes de guardar la sesión). */
  token?: string
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options
  const headers: Record<string, string> = { Accept: 'application/json' }
  let payload: BodyInit | undefined

  if (body instanceof URLSearchParams) {
    payload = body
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  const token = options.token ?? (auth ? getToken() : null)
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { method, headers, body: payload })
  } catch {
    throw new ApiError(
      'No se pudo conectar con el servidor. Verifica que el backend esté activo.',
      0,
    )
  }

  const data: unknown = response.status === 204 ? null : await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401 && auth) onUnauthorized()
    throw new ApiError(detailMessage(data, response.status), response.status)
  }
  return data as T
}

/** FastAPI responde `{ detail: string }` o `{ detail: [{ msg, loc }] }` (errores 422). */
function detailMessage(data: unknown, status: number): string {
  const detail = (data as { detail?: unknown } | null)?.detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    const msgs = detail
      .map((d) => (d as { msg?: unknown })?.msg)
      .filter((m): m is string => typeof m === 'string')
      .map((m) => m.replace(/^Value error, /, ''))
    if (msgs.length) return msgs.join('. ')
  }
  if (status === 401) return 'Tu sesión expiró. Vuelve a iniciar sesión.'
  if (status === 403) return 'No tienes permisos para esta acción.'
  if (status >= 500) return 'El servidor tuvo un problema. Intenta nuevamente.'
  return 'Ocurrió un error inesperado.'
}
