// typescript
// File: `apps/payroll-api/src/app.module.ts`
import * as fs from 'fs';
import * as path from 'path';
import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigurationModule } from './configuration-policy/configuration.module';
import { ProcessingModule } from './processing-execution/processing.module';
import { TrackingModule } from './tracking-self-service/tracking.module';

const logger = new Logger('AppModule');

function findEnvUpwards(starts: string[], maxLevels = 12): { envPath?: string; checked: string[] } {
    const checked: string[] = [];
    for (const start of starts) {
        let dir = start;
        for (let i = 0; i < maxLevels; i++) {
            const candidate = path.resolve(dir, '.env');
            checked.push(candidate);
            if (fs.existsSync(candidate)) {
                return { envPath: candidate, checked };
            }
            const parent = path.dirname(dir);
            if (!parent || parent === dir) break;
            dir = parent;
        }
    }
    return { envPath: undefined, checked };
}

// Start search from both process.cwd() and __dirname to cover different startup contexts
const { envPath: envFilePath, checked } = findEnvUpwards([process.cwd(), __dirname]);
logger.log(`Using env file: ${envFilePath ?? 'none (will use process.env)'}`);
logger.debug(`Checked .env locations: ${checked.join(', ')}`);

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: envFilePath ?? undefined,
        }),

        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                const mLogger = new Logger('MongooseModule');
                const uri =
                    configService.get<string>('MONGODB_URI') ?? process.env.MONGODB_URI;

                mLogger.log(`MONGODB_URI from ConfigService: ${Boolean(configService.get<string>('MONGODB_URI'))}`);
                mLogger.log(`MONGODB_URI from process.env: ${Boolean(process.env.MONGODB_URI)}`);

                if (!uri) {
                    mLogger.error(
                        `MONGODB_URI is missing. Checked paths: ${checked.join(', ')}; selected: ${envFilePath ?? 'none'}`,
                    );
                    throw new Error('MONGODB_URI is missing');
                }

                return { uri };
            },
            inject: [ConfigService],
        }),

        ConfigurationModule,
        ProcessingModule,
        TrackingModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}