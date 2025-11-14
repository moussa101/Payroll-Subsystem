import { Module } from '@nestjs/common';
import { ConfigurationModule } from './configuration-policy/configuration.module';
import { ProcessingModule } from './processing-execution/processing.module';
import { TrackingModule } from './tracking-self-service/tracking.module';

// Note: In a real app, you would also import Database, Auth, and Configuration modules here.

@Module({
    imports: [
        // 1. Payroll Configuration & Policy Setup Subsystem
        ConfigurationModule,

        // 2. Payroll Processing & Execution Subsystem
        ProcessingModule,

        // 3. Payroll Tracking & Self-Service Subsystem (e.g., payslips, claims)
        TrackingModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}