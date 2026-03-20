import { HttpException, HttpStatus } from "@nestjs/common";

export const UploaderErrorType = {
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  INVALID_SESSION_KEY: "INVALID_SESSION_KEY",
  UNAUTHORIZED: "UNAUTHORIZED",
  ALREADY_EXISTS: "ALREADY_EXISTS",
  S3_COMMAND_FAILED: "S3_COMMAND_FAILED",
} as const;

export class UploaderError extends HttpException {
  constructor(
    public errorType: keyof typeof UploaderErrorType,
    cause?: unknown,
  ) {
    super(errorType, UploaderError.statusCode(errorType), {
      cause,
    });
  }

  static statusCode(errorType: keyof typeof UploaderErrorType) {
    switch (errorType) {
      case UploaderErrorType.ALREADY_EXISTS:
      case UploaderErrorType.INVALID_SESSION_KEY: {
        return HttpStatus.BAD_REQUEST;
      }
      case UploaderErrorType.UNAUTHORIZED: {
        return HttpStatus.UNAUTHORIZED;
      }
      default: {
        return HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }
  }
}
