declare module "fastify" {
  interface FastifyRequest {
    session: {
      uploadId: string;
    };
  }
}
