import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigurationPolicyModule } from './configuration-policy/configuration.module';
import * as path from 'path'; // Import Node.js path module

@Module({
  imports: [
    // 1. Load Environment Variables (looking one directory up for the root .env)
    ConfigModule.forRoot({
      isGlobal: true, 
      // dirname is apps/payroll-api/src. path.join takes it up one to apps/payroll-api,
      // then another up to the project root, where .env resides.
      envFilePath: path.join(__dirname, '..', '..', '.env'), 
    }),

    // 2. Configure Mongoose using the environment variable
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        // Safely reads the MONGO_URI from the loaded environment file
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),

    // 3. Register your core feature module
    ConfigurationPolicyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}