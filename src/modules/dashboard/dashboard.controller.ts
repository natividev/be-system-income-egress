import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { RangeQueryDto } from './dto/range-query.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get('ingreso-egreso')
  async ingresoEgreso(@Query() q: RangeQueryDto) {
    return this.dashboardService.ingresoEgreso(q);
  }

  @Get('ingreso-grafica-linea')
  async ingresoGraficaLinea(@Query() q: RangeQueryDto) {
    return this.dashboardService.ingresoGraficaLinea(q);
  }

  @Get('total-globales')
  async getTotalesGlobales(@Query() q: RangeQueryDto) {
    return this.dashboardService.getTotalesGlobales(q);
  }

  @Get('cards')
  async getCards(@Query() q: RangeQueryDto) {
    return this.dashboardService.getCards(q);
  }
}
