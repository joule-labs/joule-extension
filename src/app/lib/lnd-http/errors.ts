/* tslint:disable:max-classes-per-file */
export class NetworkError extends Error {
  statusCode: number;
  constructor(message: string, code: number) {
    super(message);
    this.statusCode = code;
  }
}
export class InvalidArgumentError extends Error {};
export class MacaroonAuthError extends Error {};
export class UnknownServerError extends Error {};