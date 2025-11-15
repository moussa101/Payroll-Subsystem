import { Module } from '@nestjs/common';

@Module({
    imports: [
        // TODO: Import Mongoose Schemas for Pay Grades, Tax Rules, Insurance Brackets
    ],
    controllers: [
        // TODO: Controllers for policy definition (e.g., PayGradeController)
    ],
    providers: [
        // TODO: Services for rule enforcement and data validation
    ],
    exports: [
        // TODO: Expose services needed by the Processing Module (e.g., PolicyLookupService)
    ]
})
export class ConfigurationModule {}
