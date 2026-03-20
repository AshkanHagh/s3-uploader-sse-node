import { Injectable } from "@nestjs/common";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  EncryptionConfig,
  type IEncryptionConfig,
} from "src/config/encryption.config";
import crypto from "node:crypto";
import { UploadSession } from "./types";

@Injectable()
export class EncryptionService {
  public publicKey: string;
  public privateKey: string;
  public uploadSessions: Map<string, UploadSession>;

  constructor(@EncryptionConfig() private encryptionConfig: IEncryptionConfig) {
    this.publicKey = readFileSync(
      path.resolve(this.encryptionConfig.publicKeyPath),
      "utf-8",
    );
    this.privateKey = readFileSync(
      path.resolve(this.encryptionConfig.privateKeyPath),
      "utf-8",
    );
  }

  decryptSessionKey(encryptedBase64: string): Buffer {
    return crypto.privateDecrypt(
      {
        key: this.privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      Buffer.from(encryptedBase64, "base64"),
    );
  }
}
