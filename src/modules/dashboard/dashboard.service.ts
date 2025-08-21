import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';
import { RangeQueryDto } from './dto/range-query.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) { }

  async ingresoEgreso(q: RangeQueryDto) {
    return this.dashboardRepository.ingresoEgreso(q);
  }

  async ingresoGraficaLinea(q: RangeQueryDto) {
    return this.dashboardRepository.ingresoGraficaLinea(q);
  }

  async getTotalesGlobales(q: RangeQueryDto) {
    return this.dashboardRepository.getTotalesGlobales(q);
  }

  async getCards(q: RangeQueryDto) {
    const [{ ingreso, egreso }, totales] = await Promise.all([
      this.dashboardRepository.ingresoEgreso(q),
      this.dashboardRepository.getTotalesGlobales(q),
    ]);

    // totalTransacciones: conteo de filas (ingreso + egreso) no anuladas en rango
    const totalTransacciones = await this.dashboardRepository.countTransacciones(q);

    return {
      ingreso: totales.ingreso,           // número
      egreso: totales.egreso,             // número
      balance: (totales.ingreso ?? 0) - (totales.egreso ?? 0),
      totalTransacciones,                 // número
      // si quieres, agrega las últimas 2 muestras para que el front calcule % vs periodo previo
      muestras: {
        ingreso,
        egreso,
      },
    };
  }
}
