import { type FastifyRequest } from "fastify";

export interface IAttachmentController {
  uploadFile(contentLength: number, req: FastifyRequest): Promise<void>;
}
