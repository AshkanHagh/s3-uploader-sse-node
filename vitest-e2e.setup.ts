import { afterAll, beforeAll } from "vitest";
import { MinioContainer, StartedMinioContainer } from "@testcontainers/minio";

let minioContainer: StartedMinioContainer;

beforeAll(async () => {
  minioContainer = await new MinioContainer("quay.io/minio/minio").start();
  process.env.STORAGE_S3_ACCESS_KEY = minioContainer.getUsername();
  process.env.STORAGE_S3_SECRET_KEY = minioContainer.getPassword();
});

afterAll(async () => {
  await minioContainer.stop();
});
