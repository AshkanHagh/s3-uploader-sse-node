import { Controller, Headers, Post, Req } from "@nestjs/common";
import { AttachmentService } from "./attachment.service";
import { IAttachmentController } from "./interfaces/controller";
import { type FastifyRequest } from "fastify";

@Controller("attachments")
export class AttachmentController implements IAttachmentController {
  constructor(private attachmentService: AttachmentService) {}

  @Post()
  async uploadFile(
    @Headers("content-length") contentLength: number,
    @Req() req: FastifyRequest,
  ) {
    const file = await req.file();
    await this.attachmentService.uploadFile(contentLength, file!);
  }
}
