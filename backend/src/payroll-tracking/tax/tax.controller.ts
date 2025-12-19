import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';

@Controller('tax')
export class TaxController {
  @Get('document/:year')
  downloadTaxDoc(@Param('year') year: string, @Res() res: Response) {
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=tax-${year}.pdf`,
    });

    // Placeholder payload until PDF generation is implemented
    res.send(Buffer.from(`Tax document for ${year}`));
  }
}
