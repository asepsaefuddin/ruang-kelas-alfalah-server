import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  dotenv.config();
  try {
    const app = await NestFactory.create(AppModule);
    
    // const corsOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
    const corsOrigin = process.env.CLIENT_ORIGIN || 'https://ruang-kelas-client.vercel.app';
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.url && req.url.includes('//')) {
        req.url = req.url.replace(/\/\/+/, '/');
      }

      if (req.method === 'OPTIONS') {
        // respond to preflight directly with the correct CORS headers
        res.header('Access-Control-Allow-Origin', corsOrigin);
        res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With, Expires, Cache-Control, Pragma');
        res.header('Access-Control-Allow-Credentials', 'true');
        return res.sendStatus(204);
      }

      next();
    });

    // Enable global validation
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    // Enable CORS for frontend - More permissive for development
    app.enableCors({
      origin: corsOrigin,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'Expires', 'Cache-Control', 'Pragma'],
      credentials: true,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    });
    
    const port = process.env.PORT || 3002;
    console.log(`🔧 Attempting to start server on port ${port}`);
    await app.listen(port);
    console.log(`🚀 Server successfully running on http://localhost:${port}`);
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
});
