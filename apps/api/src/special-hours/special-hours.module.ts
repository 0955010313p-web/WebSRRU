import { Module } from '@nestjs/common';
import { SpecialHoursController } from './special-hours.controller';
import { SpecialHoursService } from './special-hours.service';

@Module({
  controllers: [SpecialHoursController],
  providers: [SpecialHoursService],
})
export class SpecialHoursModule {}
