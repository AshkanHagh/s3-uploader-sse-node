import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ContextLoggerModule } from "nestjs-context-logger";
import { AttachmentModule } from "./features/attachment/attachment.module";

@Module({
  imports: [
    ConfigModule,
    ContextLoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || "info",
        autoLogging: false,
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
    EventEmitterModule.forRoot({
      global: true,
      wildcard: true,
    }),
    AttachmentModule,
  ],
})
export class AppModule {}
