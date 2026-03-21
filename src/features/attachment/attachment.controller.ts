import {
  Body,
  Controller,
  Headers,
  Post,
  Req,
  Sse,
  UseGuards,
} from "@nestjs/common";
import { AttachmentService } from "./attachment.service";
import { IAttachmentController } from "./interfaces/controller";
import { type FastifyRequest } from "fastify";
import { UploadSessionGuard } from "../encryption/guards/upload-session.guard";

@Controller("attachments")
export class AttachmentController implements IAttachmentController {
  constructor(private attachmentService: AttachmentService) {}

  @Post("init")
  async initializeUpload(@Body() payload: { encryptedSessionKey: string }) {
    return this.attachmentService.initializeUpload(payload.encryptedSessionKey);
  }

  @Post()
  @UseGuards(UploadSessionGuard)
  async uploadFile(
    @Headers("content-length") contentLength: number,
    @Req() req: FastifyRequest,
  ) {
    const file = await req.file();
    await this.attachmentService.uploadFile(
      req.session.uploadId,
      contentLength,
      file!,
    );
  }

  @Sse("progress")
  @UseGuards(UploadSessionGuard)
  getUploadProgress(@Req() req: FastifyRequest) {
    return this.attachmentService.getUploadProgress(req.session.uploadId);
  }
}
