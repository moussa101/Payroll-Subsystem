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
        // Expose services needed by the Processing Module (e.g., PolicyLookupService)
    ]
})
export class ConfigurationModule {}


// wait for team 1 to finish their work on the configuration module before implementing the TODOs
