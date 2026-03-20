import { Injectable } from "@nestjs/common";
import { IAttachmentService } from "./interfaces/service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { MultipartFile } from "@fastify/multipart";
import { AttachmentUtilService } from "./util.service";
import { randomUUID } from "node:crypto";
import { MAX_SMALL_FILE_SIZE_LIMIT } from "./constants";
import { UploadDetailEvent } from "./types";

@Injectable()
export class AttachmentService implements IAttachmentService {
  constructor(
    private eventEmitter: EventEmitter2,
    private utilService: AttachmentUtilService,
  ) {}

  async uploadFile(totalBytes: number, file: MultipartFile) {
    const fileId = randomUUID();
    if (totalBytes > MAX_SMALL_FILE_SIZE_LIMIT) {
      // upload larg file with s3 multipart
      await this.utilService.uploadLargeFile(
        fileId,
        totalBytes,
        file.mimetype,
        file.file,
      );
    } else {
      // upload the full file to s3
      await this.utilService.uploadSmall(
        fileId,
        file.mimetype,
        totalBytes,
        file.file,
      );
    }
    await this.eventEmitter.emitAsync(`upload.${fileId}`, <UploadDetailEvent>{
      remaning: false,
    });
    return fileId;
  }
}
