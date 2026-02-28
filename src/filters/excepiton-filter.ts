import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { FastifyReply } from "fastify/types/reply";
import { ContextLogger } from "nestjs-context-logger";
import { UploaderError } from "./exception";

@Catch(HttpException)
export class UploaderExceptionFilter implements ExceptionFilter {
  private logger = new ContextLogger(UploaderExceptionFilter.name);

  catch(exception: UploaderError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    const statusCode = exception.getStatus();
    const cause = exception.cause as Error | undefined;

    if (process.env.LOG_LEVEL === "debug") {
      ContextLogger.updateContext({
        "error.cause": cause,
      });
    }
    ContextLogger.updateContext({
      "error.type": exception.errorType,
      "error.message": exception.message,
      "error.cause.message": cause?.message,
      "error.cause.name": cause?.name,
      "http.status_code": statusCode,
      "http.status_code.type": statusCode.toString(),
    });

    this.logger.error("request failed");

    reply.status(statusCode).send({
      statusCode: statusCode.toString(),
      message: exception.errorType || HttpStatus[statusCode],
    });
  }
}
