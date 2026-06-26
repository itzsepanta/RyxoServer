import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response, Request } from "express";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    @InjectPinoLogger(GlobalExceptionFilter.name)
    private readonly logger: PinoLogger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : "Internal server execution failure";

    const errorDetails = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      response: typeof message === "object" ? message : { message },
    };

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        { err: exception, context: "FatalException" },
        `CRITICAL FAILURE: ${request.method} ${request.url}`,
      );
    } else {
      this.logger.warn(
        { context: "HttpException" },
        `Client Exception [${status}]: ${request.method} ${request.url}`,
      );
    }

    response.status(status).json(errorDetails);
  }
}
