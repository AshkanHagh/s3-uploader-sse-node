import { Inject, Injectable } from "@nestjs/common";
import { FILE_PART_SIZE, S3_CLIENT } from "./constants";
import {
  AbortMultipartUploadCommand,
  CompletedPart,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from "@aws-sdk/client-s3";
import { type IStorageConfig, StorageConfig } from "src/config/storage.config";
import { Readable } from "stream";
import { UploaderError, UploaderErrorType } from "src/filters/exception";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { UploadDetailEvent } from "./types";

@Injectable()
export class AttachmentUtilService {
  constructor(
    @Inject(S3_CLIENT) private client: S3Client,
    @StorageConfig() private storageConfig: IStorageConfig,
    private eventEmitter: EventEmitter2,
  ) {}

  async uploadLargeFile(
    id: string,
    totalBytes: number,
    contentType: string,
    stream: Readable,
  ) {
    const bucket = this.storageConfig.bucket;
    const { UploadId } = await this.client.send(
      new CreateMultipartUploadCommand({
        Bucket: bucket,
        ContentType: contentType,
        Key: id,
      }),
    );

    let bytesProcessed = 0;
    let partNumber = 1;
    let buffer = Buffer.alloc(0);
    const parts: CompletedPart[] = [];

    try {
      for await (const chunk of stream) {
        const chunkBuf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        buffer = Buffer.concat([buffer, chunkBuf]);
        console.log(buffer.length);

        while (buffer.length >= FILE_PART_SIZE) {
          const partResult = await this.client.send(
            new UploadPartCommand({
              Bucket: bucket,
              Key: id,
              PartNumber: partNumber,
              Body: buffer,
              UploadId,
            }),
          );
          parts.push({
            ETag: partResult.ETag,
            PartNumber: partNumber,
          });

          bytesProcessed += buffer.length;
          await this.eventEmitter.emitAsync(`upload.${id}`, <UploadDetailEvent>{
            totalBytes,
            uploadedBytes: bytesProcessed,
            remaning: true,
          });
          partNumber++;
          buffer = buffer.subarray(FILE_PART_SIZE);
        }
      }

      if (buffer.length > 0) {
        const partResult = await this.client.send(
          new UploadPartCommand({
            Bucket: bucket,
            Key: id,
            PartNumber: partNumber,
            Body: buffer,
            UploadId,
          }),
        );
        parts.push({
          ETag: partResult.ETag,
          PartNumber: partNumber,
        });

        bytesProcessed += buffer.length;
        await this.eventEmitter.emitAsync(`upload.${id}`, <UploadDetailEvent>{
          totalBytes,
          uploadedBytes: bytesProcessed,
          remaning: true,
        });
        buffer = Buffer.alloc(0);
      }

      await this.client.send(
        new CompleteMultipartUploadCommand({
          Bucket: bucket,
          Key: id,
          UploadId,
          MultipartUpload: { Parts: parts },
        }),
      );
    } catch (error) {
      await this.client
        .send(
          new AbortMultipartUploadCommand({
            Bucket: bucket,
            Key: id,
            UploadId,
          }),
        )
        .catch(() => {});
      throw new UploaderError(UploaderErrorType.INTERNAL_SERVER_ERROR, error);
    }
  }

  async uploadSmall(
    id: string,
    contentType: string,
    totalBytes: number,
    stream: Readable,
  ) {
    let bytesProcessed = 0;
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      const chunkBuf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      chunks.push(chunkBuf);
      bytesProcessed += chunkBuf.length;

      await this.eventEmitter.emitAsync(`upload.${id}`, <UploadDetailEvent>{
        totalBytes,
        uploadedBytes: bytesProcessed,
        remaning: true,
      });
    }

    const buffer = Buffer.concat(chunks);

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.storageConfig.bucket,
          Key: id,
          ContentType: contentType,
          Body: buffer,
        }),
      );
    } catch (error) {
      throw new UploaderError(UploaderErrorType.INTERNAL_SERVER_ERROR, error);
    }
  }
}
