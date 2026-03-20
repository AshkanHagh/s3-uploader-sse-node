import { HttpException, HttpStatus } from "@nestjs/common";

export const UploaderErrorType = {
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
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
      case UploaderErrorType.UNAUTHORIZED: {
        return HttpStatus.UNAUTHORIZED;
      }
      default: {
        return HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }
  }
}
