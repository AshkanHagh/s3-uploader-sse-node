import { MultipartFile } from "@fastify/multipart";

export interface IAttachmentService {
  uploadFile(totalBytes: number, file: MultipartFile): Promise<string>;
}
