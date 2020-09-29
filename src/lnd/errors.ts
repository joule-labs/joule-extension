/* tslint:disable:max-classes-per-file */

type ErrorConstructor = new (...args: any[]) => Error;

/**
 * Workaround for custom errors when compiling typescript targeting 'ES5'.
 * see: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
 * @param {CustomError} error
 * @param newTarget the value of `new.target`
 * @param {Function} errorType
 */
// tslint:enable:max-line-length
function fixError(
  error: Error,
  newTarget: ErrorConstructor,
  errorType: ErrorConstructor,
) {
  Object.setPrototypeOf(error, errorType.prototype);

  // when an error constructor is invoked with the `new` operator
  if (newTarget === errorType) {
    error.name = newTarget.name;

    // exclude the constructor call of the error type from the stack trace.
    if (Error.captureStackTrace) {
      Error.captureStackTrace(error, errorType);
    } else {
      const stack = new Error(error.message).stack;
      if (stack) {
        error.stack = fixStack(stack, `new ${newTarget.name}`);
      }
    }
  }
}
function fixStack(stack: string, functionName: string) {
  if (!stack) return stack;
  if (!functionName) return stack;

  // exclude lines starts with:  "  at functionName "
  const exclusion: RegExp = new RegExp(`\\s+at\\s${functionName}\\s`);

  const lines = stack.split('\n');
  const resultLines = lines.filter(line => !line.match(exclusion));
  return resultLines.join('\n');
}

export class NetworkError extends Error {
  statusCode: number;
  constructor(message: string, code: number) {
    super(message);
    this.statusCode = code;
  }
}

export class InvalidArgumentError extends Error {
  constructor(message: string) {
    super(message);
    fixError(this, new.target, InvalidArgumentError);
  }
}

export class MacaroonAuthError extends Error {
  constructor(message: string) {
    super(message);
    fixError(this, new.target, MacaroonAuthError);
  }
}

export class PermissionDeniedError extends Error {
  constructor(message: string) {
    super(message);
    fixError(this, new.target, PermissionDeniedError);
  }
}

export class UnknownServerError extends Error {
  constructor(message: string) {
    super(message);
    fixError(this, new.target, UnknownServerError);
  }
}

export class SendTransactionError extends Error {
  constructor(message: string) {
    super(message);
    fixError(this, new.target, SendTransactionError);
  }
}

export class NoRouteError extends Error {
  constructor(message: string) {
    super(message);
    fixError(this, new.target, NoRouteError);
  }
}

export class AlreadyConnectedError extends Error {
  constructor(message: string) {
    super(message);
    fixError(this, new.target, AlreadyConnectedError);
  }
}
