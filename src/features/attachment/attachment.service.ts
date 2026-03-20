import { Injectable } from "@nestjs/common";
import { IAttachmentService } from "./interfaces/service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { MultipartFile } from "@fastify/multipart";
import { AttachmentUtilService } from "./util.service";
import { randomUUID } from "node:crypto";
import { MAX_SMALL_FILE_SIZE_LIMIT } from "./constants";
import { UploadDetailEvent } from "./types";
import { UploaderError, UploaderErrorType } from "src/filters/exception";
import { EncryptionService } from "../encryption/encryption.service";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AttachmentService implements IAttachmentService {
  constructor(
    private eventEmitter: EventEmitter2,
    private utilService: AttachmentUtilService,
    private encryptionService: EncryptionService,
    private jwtService: JwtService,
  ) {}

  async initializeUpload(encryptedSessionKey: string) {
    let sessionKey: Buffer;
    try {
      sessionKey =
        this.encryptionService.decryptSessionKey(encryptedSessionKey);
    } catch (error) {
      throw new UploaderError(UploaderErrorType.INVALID_SESSION_KEY, error);
    }

    const uploadId = this.encryptionService.deriveUploadId(sessionKey);
    if (this.encryptionService.uploadSessions.get(uploadId)) {
      throw new UploaderError(UploaderErrorType.ALREADY_EXISTS);
    }
    this.encryptionService.uploadSessions.set(uploadId, sessionKey);

    const token = await this.jwtService.signAsync(
      { uploadId },
      {
        secret: sessionKey,
        expiresIn: "10m",
        algorithm: "HS256",
      },
    );

    return { token, id: uploadId };
  }

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
