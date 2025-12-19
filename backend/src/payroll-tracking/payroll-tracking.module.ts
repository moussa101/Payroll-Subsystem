import { forwardRef, Module } from '@nestjs/common';
import { PayrollTrackingController } from './payroll-tracking.controller';
import { PayrollTrackingService } from './payroll-tracking.service';
import { MongooseModule } from '@nestjs/mongoose';
import { refunds, refundsSchema } from './models/refunds.schema';
import { claims, claimsSchema } from './models/claims.schema';
import { disputes, disputesSchema } from './models/disputes.schema';
import { PayrollConfigurationModule } from '../payroll-configuration/payroll-configuration.module';
import { PayrollExecutionModule } from '../payroll-execution/payroll-execution.module';
import { TaxController } from './tax/tax.controller';
import { RefundsService } from './services/refunds.service';
import { ClaimsService } from './services/claims.service';
import { DisputesService } from './services/disputes.service';
import {
  payrollRuns,
  payrollRunsSchema,
} from '../payroll-execution/models/payrollRuns.schema';
import { ClaimsController } from './controllers/claims.controller';
import { DisputesController } from './controllers/disputes.controller';
import { RefundsController } from './controllers/refunds.controller';
import { AuthModule } from '../auth/auth.module';

@Module({

  imports: [
    PayrollConfigurationModule,
    forwardRef(() => PayrollExecutionModule),
    AuthModule,
    MongooseModule.forFeature([
      { name: refunds.name, schema: refundsSchema },
      { name: claims.name, schema: claimsSchema },
      { name: disputes.name, schema: disputesSchema },
      { name: payrollRuns.name, schema: payrollRunsSchema },
    ])],
  controllers: [PayrollTrackingController, TaxController, ClaimsController, DisputesController, RefundsController],
  providers: [PayrollTrackingService, RefundsService, ClaimsService, DisputesService],
  exports:[PayrollTrackingService]
})
export class PayrollTrackingModule { }
