import { Module } from "@nestjs/common";
import { AttachmentService } from "./attachment.service";
import { AttachmentController } from "./attachment.controller";
import { AttachmentUtilService } from "./util.service";
import { S3Client } from "@aws-sdk/client-s3";
import { S3_CLIENT } from "./constants";

@Module({
  controllers: [AttachmentController],
  providers: [
    AttachmentService,
    AttachmentUtilService,
    {
      provide: S3_CLIENT,
      useFactory: () => {
        return new S3Client({
          endpoint: process.env.STORAGE_S3_ENDPOINT!,
          region: process.env.STORAGE_S3_REGION!,
          forcePathStyle: true,
          credentials: {
            accessKeyId: process.env.STORAGE_S3_ACCESS_KEY!,
            secretAccessKey: process.env.STORAGE_S3_SECRET_KEY!,
          },
        });
      },
    },
  ],
})
export class AttachmentModule {}
