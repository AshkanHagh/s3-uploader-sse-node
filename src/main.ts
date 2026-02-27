import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.enableCors({ origin: process.env.CORS_ORIGIN });
  app.setGlobalPrefix("api");
  app.enableShutdownHooks();

  await app.register(import("@fastify/multipart"));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
