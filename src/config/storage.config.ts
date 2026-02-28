import { Inject } from "@nestjs/common";
import { ConfigType, registerAs } from "@nestjs/config";

export const storageConfig = registerAs("storage", () => ({
  region: process.env.STORAGE_S3_REGION!,
  usePathStyle: process.env.STORAGE_S3_USE_PATH_STYLE === "true",
  bucket: process.env.STORAGE_S3_BUCKET!,
  accessKey: process.env.STORAGE_S3_ACCESS_KEY!,
  secretKey: process.env.STORAGE_S3_SECRET_KEY!,
}));

export const StorageConfig = () => Inject(storageConfig.KEY);
export type IStorageConfig = ConfigType<typeof storageConfig>;
