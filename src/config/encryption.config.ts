import { Inject } from "@nestjs/common";
import { ConfigType, registerAs } from "@nestjs/config";

export const encryptionConfig = registerAs("encryption", () => ({
  publicKeyPath: process.env.RSA_PUBLIC_KEY_PATH!,
  privateKeyPath: process.env.RSA_PRIVATE_KEY_PATH!,
}));

export const EncryptionConfig = () => Inject(encryptionConfig.KEY);
export type IEncryptionConfig = ConfigType<typeof encryptionConfig>;
