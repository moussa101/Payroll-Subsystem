import { Module } from '@nestjs/common';
import { ProcessingModule } from '../processing-execution/processing.module';

@Module({
    imports: [
        // This module depends on Processing for finalized salary data/payslips
        ProcessingModule,
        // TODO: Import Mongoose Schemas for Disputes and Claims
    ],
    controllers: [
        // TODO: Controllers for Payslip retrieval, dispute submission, claim tracking
    ],
    providers: [
        // TODO: Services for data visibility, audit logging, and refund processing
    ],
})
export class TrackingModule {}