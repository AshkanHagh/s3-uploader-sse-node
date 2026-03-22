import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { Test } from "@nestjs/testing";
import { AppModule } from "src/app.module";

export async function createNestAppInstance() {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );
  app.setGlobalPrefix("api");
  app.enableShutdownHooks();
  await app.register(import("@fastify/multipart"), {
    limits: {
      files: 1,
      fileSize: 500 * 1024 ** 3,
    },
  });
  await app.init();

  return app;
}
