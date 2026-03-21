# s3-uploader-sse-node

A modern Node.js reimplementation of [s3-uploader-sse](https://github.com/AshkanHagh/s3-uploader-sse), originally written in Rust. The original project was a straightforward large file uploader with SSE-based progress tracking. This version preserves that core idea and adds an encrypted session key exchange layer on top of it.

---

## How It Works

The upload flow works in three steps. The client generates a random AES session key and encrypts it with the server's RSA public key, then sends it to the init endpoint. The server decrypts the session key, stores it in memory, and returns a short-lived JWT token signed with that session key along with a unique upload ID.

The client then uploads the file using that token for authentication. The server verifies the token against the in-memory session key before accepting the upload. Depending on file size, the server either does a standard S3 put for small files or S3 multipart upload for large files.

At any point during the upload, the client can open an SSE connection to receive real-time progress events. The progress reporting differs depending on file size. For large files, an event is emitted after each multipart part is successfully uploaded to S3. For small files, an event is emitted on each chunk read from the file stream before the upload to S3 happens. In both cases the stream closes automatically when the upload completes.

---

## Design Decisions

**No Zod.** The API surface is minimal and the inputs are well-defined. Adding a runtime validation library would increase complexity without meaningful benefit here.

**Structured error handling.** All errors use a typed `UploaderError` class and are caught by a global exception filter. This keeps error responses consistent and ensures error type, HTTP status, and cause are always captured together in logs.

**Structured logging.** The project uses `nestjs-context-logger` backed by Pino. In development, output goes through `pino-pretty`. In production, logs are emitted as JSON for log aggregation.

**In-memory session store.** Upload sessions are kept in a `Map` in memory. Sessions do not survive a server restart, which is acceptable given the short token TTL. If you need horizontal scaling, you must use sticky session load balancing so that the init request and the subsequent upload and SSE requests from the same client all route to the same instance.

---

## Running the Project

**1. Clone the repository and install dependencies:**

```bash
pnpm install
```

**2. Generate an RSA key pair:**

```bash
mkdir -p secrets
openssl genpkey -algorithm RSA -out secrets/private.pem -pkeyopt rsa_keygen_bits:2048
openssl rsa -pubout -in secrets/private.pem -out secrets/public.pem
```

**3. Copy the example environment file and fill in your values:**

```bash
cp .env.example .env
```

**4. Start MinIO locally (optional, if you do not have an S3 bucket):**

```bash
docker compose up -d
```

**5. Start the server:**

```bash
# Development
pnpm run start:dev

# Production
pnpm run build && pnpm run start:prod
```

The API will be available at `http://127.0.0.1:7319/api`.

---

## API Reference

The Postman collection is located at `/docs/s3-uploader-sse-node.json`. Import it into Postman to explore all available endpoints.
