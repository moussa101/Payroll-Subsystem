import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

// Define the port, defaulting to 3000
const PORT = process.env.PORT || 3000;

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Apply a global validation pipe for all incoming request DTOs
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true, // Remove properties that are not defined in the DTO
        transform: true, // Automatically transform payloads to be objects of the DTO classes
        forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
    }));

    // Enable CORS for frontend communication (adjust origins in a production environment)
    app.enableCors({
        origin: '*', // Allow all origins for development
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    await app.listen(PORT);
    Logger.log(
        `🚀 Payroll API is running on: http://localhost:${PORT}`,
        'Bootstrap'
    );
}
bootstrap();