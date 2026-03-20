import { MultipartFile } from "@fastify/multipart";

export interface IAttachmentService {
  uploadFile(
    uploadId: string,
    totalBytes: number,
    file: MultipartFile,
  ): Promise<void>;
}
