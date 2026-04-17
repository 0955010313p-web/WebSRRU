import { Controller, Get, Res, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import type { Response } from 'express';
import { CurrentUser, JwtUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CertificatesService } from './certificates.service';

@ApiTags('certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificates: CertificatesService) {}

  @Get('me/participation.pdf')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Download PDF certificate when eligible' })
  async mine(
    @CurrentUser() user: JwtUser,
    @Res({ passthrough: false }) res: Response,
  ) {
    const result = await this.certificates.participationPdfBuffer(user.sub);
    const buf = (result as any).pdfBuffer ?? result;
    const certNum = (result as any).certificateNumber ?? 'certificate';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="participation-${certNum}.pdf"`,
    );
    res.send(buf);
  }

  @Get('verify/:certificateNumber')
  async verifyPublic(@Param('certificateNumber') certificateNumber: string) {
    return this.certificates.verifyCertificate(certificateNumber);
  }
}
