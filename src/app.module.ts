import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { ContextLoggerModule } from "nestjs-context-logger";
import { ConfigModule } from "./config/config.module";

@Module({
  imports: [
    ConfigModule,
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
    EventEmitterModule.forRoot({
      global: true,
      wildcard: true,
    }),
  ],
})
export class AppModule {}
