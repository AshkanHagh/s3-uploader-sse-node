import { Module } from "@nestjs/common";
import { ContextLoggerModule } from "nestjs-context-logger";
import { ConfigModule } from "./config/config.module";
import { AttachmentModule } from "./features/attachment/attachment.module";
import { APP_FILTER } from "@nestjs/core";
import { UploaderExceptionFilter } from "./filters/excepiton-filter";

@Module({
  imports: [
    ConfigModule,
    AttachmentModule,
    ContextLoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || "info",
        autoLogging: true,
        quietReqLogger: true,
        transport:
          process.env.NODE_ENV !== "production"
            ? {
                target: "pino-pretty",
                options: {
                  colorize: false,
                  ignore: "pid,hostname,context,component",
                },
              }
            : undefined,
      },
      forRoutes: ["*path"],
    }),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: UploaderExceptionFilter,
    },
  ],
})
export class AppModule {}
