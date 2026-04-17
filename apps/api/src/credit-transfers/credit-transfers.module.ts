import { Module } from '@nestjs/common';
import { CreditTransfersController } from './credit-transfers.controller';
import { CreditTransfersService } from './credit-transfers.service';

@Module({
  controllers: [CreditTransfersController],
  providers: [CreditTransfersService],
})
export class CreditTransfersModule {}
