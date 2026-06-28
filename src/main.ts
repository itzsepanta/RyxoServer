// src/main.ts

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger } from "nestjs-pino";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { Request, Response } from "express";
import * as fs from "fs";
import * as path from "path";
import * as express from "express";

async function bootstrap() {
  // --- SSL/HTTPS CONFIGURATION LOGIC ---
  const isSslEnabled = process.env.SSL_ENABLED === "true";
  let httpsOptions = null;

  if (isSslEnabled) {
    const keyPath = path.join(process.cwd(), "certs", "server.key");
    const certPath = path.join(process.cwd(), "certs", "server.crt");

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };
      console.log("SSL Certificates found. RyxoServer running with HTTPS.");
    } else {
      console.error(
        "SSL_ENABLED is true, but files not found in /certs/ folder!",
      );
    }
  }

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    ...(httpsOptions && { httpsOptions }),
  });

  const loggerInstance = app.get(Logger);
  app.useLogger(loggerInstance);

  // Helmet integration
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Static files for 404 page
  app.use("/404", express.static(path.join(process.cwd(), "public", "404")));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    maxAge: 86400,
  });

  // Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle("RyxoServer Core Architecture")
    .setDescription("Grade robust platform infrastructure blueprint.")
    .setVersion("1.1.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT Token",
        in: "header",
      },
      "JWT-Auth",
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  const serverInstance = app.getHttpAdapter().getInstance();
  serverInstance.get("/docs-json", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerDocument);
  });

  // 404 Handler (Fallback for non-API routes)
  app.use((req: Request, res: Response, next: Function) => {
    if (!req.path.startsWith("/v1")) {
      res
        .status(404)
        .sendFile(path.join(process.cwd(), "public", "404", "index.html"));
    } else {
      next();
    }
  });

  process.on("unhandledRejection", (reason: unknown) =>
    console.error("CRITICAL UNHANDLED REJECTION:", reason),
  );
  process.on("uncaughtException", (error: Error) => {
    console.error("CRITICAL UNCAUGHT EXCEPTION:", error);
    process.exit(1);
  });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port, "0.0.0.0");

  const protocol = isSslEnabled && httpsOptions ? "https" : "http";
  loggerInstance.log(
    { context: "Bootstrap" },
    `RYXO DASHBOARD ACTIVE AT: ${protocol}://localhost:${port}/docs/index.html`,
  );
}

void bootstrap();
