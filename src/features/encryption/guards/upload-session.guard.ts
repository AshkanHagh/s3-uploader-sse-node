import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { FastifyRequest } from "fastify";
import { UploaderError, UploaderErrorType } from "src/filters/exception";
import { EncryptionService } from "../encryption.service";
import { SessionTokenPayload } from "../types";

@Injectable()
export class UploadSessionGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private encryptionService: EncryptionService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<FastifyRequest>();

    const authorization = req.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
      throw new UploaderError(UploaderErrorType.UNAUTHORIZED);
    }
    const token = authorization.split(" ")[1];

    const decoded = this.jwtService.decode<SessionTokenPayload>(token);
    if (!decoded.uploadId) {
      throw new UploaderError(UploaderErrorType.UNAUTHORIZED);
    }

    const session = this.encryptionService.uploadSessions.get(decoded.uploadId);
    if (!session) {
      throw new UploaderError(UploaderErrorType.UNAUTHORIZED);
    }

    try {
      await this.jwtService.verifyAsync<SessionTokenPayload>(token, {
        secret: session,
        algorithms: ["HS256"],
      });

      req.session = {
        uploadId: decoded.uploadId,
      };
    } catch (error) {
      throw new UploaderError(UploaderErrorType.UNAUTHORIZED, error);
    }

    return true;
  }
}
