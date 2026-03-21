import { Injectable } from "@nestjs/common";
import { IAttachmentService } from "./interfaces/service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { MultipartFile } from "@fastify/multipart";
import { AttachmentUtilService } from "./util.service";
import { MAX_SMALL_FILE_SIZE_LIMIT } from "./constants";
import { UploadDetailEvent } from "./types";
import { UploaderError, UploaderErrorType } from "src/filters/exception";
import { EncryptionService } from "../encryption/encryption.service";
import { JwtService } from "@nestjs/jwt";
import { fromEvent, map, takeWhile } from "rxjs";
import { randomUUID } from "node:crypto";

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

    const uploadId = randomUUID();
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

  async uploadFile(uploadId: string, totalBytes: number, file: MultipartFile) {
    if (totalBytes > MAX_SMALL_FILE_SIZE_LIMIT) {
      // upload larg file with s3 multipart
      await this.utilService.uploadLargeFile(
        uploadId,
        totalBytes,
        file.mimetype,
        file.file,
      );
    } else {
      // upload the full file to s3
      await this.utilService.uploadSmall(
        uploadId,
        file.mimetype,
        totalBytes,
        file.file,
      );
    }
    await this.eventEmitter.emitAsync(`upload.${uploadId}`, <UploadDetailEvent>{
      remaning: false,
    });
  }

  getUploadProgress(uploadId: string) {
    return fromEvent(this.eventEmitter, `upload.${uploadId}`).pipe(
      map((payload) => ({ data: payload }) as { data: UploadDetailEvent }),
      takeWhile((event) => event.data.remaning, true),
    );
  }
}
