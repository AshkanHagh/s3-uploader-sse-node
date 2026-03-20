import { Global, Module } from "@nestjs/common";
import { ConfigModule as BaseConfigModule } from "@nestjs/config";
import { storageConfig } from "./storage.config";
import { encryptionConfig } from "./encryption.config";

@Global()
@Module({
  imports: [
    BaseConfigModule.forRoot({
      isGlobal: true,
      load: [storageConfig, encryptionConfig],
    }),
  ],
})
export class ConfigModule {}
