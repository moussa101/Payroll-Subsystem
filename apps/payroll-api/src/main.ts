import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function listenWithRetry(app: any, startPort: number, maxAttempts = 5) {
    const logger = new Logger('Bootstrap');
    let port = startPort;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            await app.listen(port);
            return port;
        } catch (err: any) {
            if (err?.code === 'EADDRINUSE') {
                logger.warn(`Port ${port} in use. Retrying with port ${port + 1} (${attempt + 1}/${maxAttempts})`);
                port += 1;
                // small delay before retrying
                await new Promise((res) => setTimeout(res, 200));
                continue;
            }
            throw err;
        }
    }
    throw new Error(`Failed to bind to a free port after ${maxAttempts} attempts starting from ${startPort}`);
}

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);
    const portFromEnv =
        configService.get<string>('API_PORT') ?? configService.get<string>('PORT');
    const initialPort = Number.isFinite(Number(portFromEnv)) ? Number(portFromEnv) : 4000;

    const GLOBAL_PREFIX = 'api';
    app.setGlobalPrefix(GLOBAL_PREFIX);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
        }),
    );

    const frontendUrl = configService.get<string>('FRONTEND_URL') || undefined;
    app.enableCors({
        origin: frontendUrl ?? true,
        credentials: Boolean(frontendUrl),
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    });

    const boundPort = await listenWithRetry(app, initialPort, 6);
    Logger.log(
        ` Payroll API is running on: http://localhost:${boundPort}/${GLOBAL_PREFIX}`,
        'Bootstrap',
    );
}

bootstrap();