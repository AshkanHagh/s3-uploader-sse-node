import { Controller, Get } from "@nestjs/common";
import { EncryptionService } from "./encryption.service";
import crypto from "node:crypto";

@Controller("encryption")
export class EncryptionController {
  constructor(private encryptionService: EncryptionService) {}

  // TODO: remove in production, dev/test only route
  @Get("session-key")
  generateClientPayload() {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Not available");
    }

    const publicKey = this.encryptionService.publicKey;

    const sessionKey = crypto.randomBytes(32);
    return crypto
      .publicEncrypt(
        {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: "sha256",
        },
        sessionKey,
      )
      .toString("base64");
  }
}
