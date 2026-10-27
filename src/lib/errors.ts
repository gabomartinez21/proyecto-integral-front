export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
