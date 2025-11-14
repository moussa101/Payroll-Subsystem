import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigurationModule } from './configuration-policy/configuration.module';
import { ProcessingModule } from './processing-execution/processing.module';
import { TrackingModule } from './tracking-self-service/tracking.module';

@Module({
    imports: [
        // Global configuration module to load .env variables
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
        }),
        // MongoDB connection setup
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                // Using the MONGODB_URI defined in your .env.example
                uri: configService.get<string>('MONGODB_URI'),
            }),
            inject: [ConfigService],
        }),

        // Core Payroll Subsystems (The three modules you defined)
        ConfigurationModule,
        ProcessingModule,
        TrackingModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}