export type SessionTokenPayload = {
  uploadId: string;
};

export type UploadSession = {
  sessionKey: Buffer;
  fileHash: string;
};
