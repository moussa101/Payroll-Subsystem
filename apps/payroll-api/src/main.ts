import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);
    const portFromEnv =
        configService.get<string>('API_PORT') ?? configService.get<string>('PORT');
    const PORT = Number.isFinite(Number(portFromEnv)) ? Number(portFromEnv) : 4000;

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

    await app.listen(PORT);
    Logger.log(
        `🚀 Payroll API is running on: http://localhost:${PORT}/${GLOBAL_PREFIX}`,
        'Bootstrap',
    );
}

bootstrap();