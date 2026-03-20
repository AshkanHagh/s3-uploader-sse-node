import { Module } from "@nestjs/common";
import { EncryptionService } from "./encryption.service";
import { EncryptionController } from "./encryption.controller";
import { UploadSessionGuard } from "./guards/upload-session.guard";

@Module({
  providers: [EncryptionService, UploadSessionGuard],
  controllers: [EncryptionController],
  exports: [EncryptionService, UploadSessionGuard],
})
export class EncryptionModule {}
