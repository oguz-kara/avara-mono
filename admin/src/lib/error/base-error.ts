export class BaseError extends Error {
  public readonly errorCode: string
  public readonly error: string
  constructor(message: string, errorCode: string) {
    super()
    this.errorCode = errorCode
    this.error = message
  }
}
