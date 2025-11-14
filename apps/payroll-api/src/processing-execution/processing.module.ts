import { Module } from '@nestjs/common';
import { ConfigurationModule } from '../configuration-policy/configuration.module';

@Module({
    imports: [
        // This module depends on Configuration for rules and policies
        ConfigurationModule,
        // TODO: Import Mongoose Schemas for Payroll Drafts and Final Batches
    ],
    controllers: [
        // TODO: Controllers for initiation, simulation, and execution
    ],
    providers: [
        // TODO: Services for calculation logic, draft generation, and anomaly flagging
    ],
    exports: [
        // Expose services needed by the Tracking Module (e.g., PayslipGenerationService)
    ]
})
export class ProcessingModule {}


//
