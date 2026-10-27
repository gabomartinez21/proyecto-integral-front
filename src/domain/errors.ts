/** Error de regla de negocio: su mensaje está pensado para mostrarse al usuario. */
export class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DomainError'
  }
}

export function fail(message: string): never {
  throw new DomainError(message)
}
