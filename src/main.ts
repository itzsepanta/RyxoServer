// src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  
  const loggerInstance = app.get(Logger);
  app.useLogger(loggerInstance);

  // Helmet integration fine-tuned to completely open up serving custom static local UI files
  app.use(helmet({
    contentSecurityPolicy: false, 
    crossOriginEmbedderPolicy: false,
  }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  // Core URI Versioning Protocol Configured (Appends /v1 to all mapped endpoint routes)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    maxAge: 86400,
  });

  // --- SWAGGER BLUEPRINT DOCUMENT BUILDER ---
  const swaggerConfig = new DocumentBuilder()
    .setTitle('RyxoServer Core Architecture')
    .setDescription('Grade robust platform infrastructure blueprint.')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your valid Administrative or User JWT Access Token to access secure network routes',
        in: 'header',
      },
      'JWT-Auth',
    )
    .build();

  // Create the comprehensive schema definition metadata object
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  
  // FIX: Directly serve the clean, raw JSON schema contract on /docs-json route via HTTP Express Context
  const serverInstance = app.getHttpAdapter().getInstance();
  serverInstance.get('/docs-json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
  });

  // Global Node.js Runtime Exception Handlers
  process.on('unhandledRejection', (reason: unknown) => {
    console.error('CRITICAL UNHANDLED REJECTION DETECTED:', reason);
  });

  process.on('uncaughtException', (error: Error) => {
    console.error('CRITICAL UNCAUGHT EXCEPTION DETECTED:', error);
    process.exit(1);
  });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port, '0.0.0.0');
  
  loggerInstance.log(
    { context: 'Bootstrap' }, 
    `RYXO DASHBOARD ACTIVE AT: http://localhost:${port}/docs/index.html`
  );
  loggerInstance.log(
    { context: 'Bootstrap' }, 
    `LIVE METRICS POOL API: http://localhost:${port}/v1/monitor/status-pool`
  );
  loggerInstance.log(
    { context: 'Bootstrap' }, 
    `VISUAL STATUS PAGE CLIENT: http://localhost:${port}/status`
  );
}

void bootstrap();