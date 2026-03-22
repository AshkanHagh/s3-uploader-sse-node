import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { UploaderErrorType } from "src/filters/exception";
import { createNestAppInstance } from "test/test.helper";
import { beforeAll, describe, it, expect } from "vitest";

describe("AttachmentController", () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await createNestAppInstance();
  });

  describe(".initializeUpload", () => {
    it("should create a upload session with client encrypted public key", async () => {
      const encryptedSessionKey: string = (
        await app.inject({
          method: "GET",
          url: "/api/encryptions/session-key",
        })
      ).body;

      const initRes = await app.inject({
        method: "POST",
        url: "/api/attachments/init",
        payload: { encryptedSessionKey },
      });
      expect(initRes.statusCode).toBe(201);
      expect(initRes.json().token).toBeDefined();
    });

    it("should throw error on invalid public key", async () => {
      const encryptedSessionKey = "invalid-session-key";
      const initRes = await app.inject({
        method: "POST",
        url: "/api/attachments/init",
        payload: { encryptedSessionKey },
      });
      const error: { message: string } = initRes.json();

      expect(initRes.statusCode).toEqual(400);
      expect(error.message).toEqual(UploaderErrorType.INVALID_SESSION_KEY);
    });
  });
});
