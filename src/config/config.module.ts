import { Global, Module } from "@nestjs/common";
import { ConfigModule as BaseConfigModule } from "@nestjs/config";
import { storageConfig } from "./storage.config";

@Global()
@Module({
  imports: [
    BaseConfigModule.forRoot({
      isGlobal: true,
      load: [storageConfig],
    }),
  ],
})
export class ConfigModule {}
