import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProcessingModule } from '../processing-execution/processing.module';

import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';

// Schemas
import { Payroll, PayrollSchema } from './schema/payroll.schema';
import { ExpenseClaim, ExpenseClaimSchema } from './schema/claim.schema';
import { PayrollDispute, PayrollDisputeSchema } from './schema/dispute.schema';

@Module({
    imports: [
        // This module depends on Processing for finalized salary data/payslips
        ProcessingModule,

        // TODO: Import Mongoose Schemas for Disputes and Claims
        MongooseModule.forFeature([
            { name: Payroll.name, schema: PayrollSchema },
            { name: ExpenseClaim.name, schema: ExpenseClaimSchema },
            { name: PayrollDispute.name, schema: PayrollDisputeSchema },
        ]),
    ],
    controllers: [
        // TODO: Controllers for Payslip retrieval, dispute submission, claim tracking
        TrackingController,
    ],
    providers: [
        // TODO: Services for data visibility, audit logging, and refund processing
        TrackingService,
    ],
})
export class TrackingModule {}
