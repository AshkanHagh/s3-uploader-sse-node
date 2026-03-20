import { Module } from "@nestjs/common";
import { EncryptionService } from "./encryption.service";
import { EncryptionController } from "./encryption.controller";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [JwtModule.register({})],
  providers: [EncryptionService],
  controllers: [EncryptionController],
})
export class EncryptionModule {}
