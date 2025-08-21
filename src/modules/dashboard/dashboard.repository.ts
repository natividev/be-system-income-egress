// dashboard.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';
import { RangeQueryDto } from './dto/range-query.dto';

type SerieItem = { fecha_actividad: string; cantidad: number };

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) { }

  private toDateOrNull(d?: string) {
    return d ? new Date(d) : null;
  }

  async ingresoEgreso(q: RangeQueryDto) {
    const [ingreso, egreso] = await Promise.all([
      this.getIngreso(q),
      this.getEgreso(q),
    ]);
    return { ingreso, egreso };
  }

  async ingresoGraficaLinea(q: RangeQueryDto) {
    return this.getIngreso(q);
  }

  private async getIngreso(q: RangeQueryDto): Promise<SerieItem[]> {
    const from = this.toDateOrNull(q.from);
    const to = this.toDateOrNull(q.to);

    const where = Prisma.sql`
      i.anulado = false
      ${from ? Prisma.sql` AND i.fecha_actividad >= ${from}` : Prisma.empty}
      ${to ? Prisma.sql` AND i.fecha_actividad <= ${to}` : Prisma.empty}
    `;

    const query = Prisma.sql`
  SELECT
    DATE_FORMAT(i.fecha_actividad, '%Y-%m-%d') AS fecha_actividad,
    SUM(i.cantidad) AS cantidad
  FROM ingreso i
  WHERE
    i.anulado = false
    ${from ? Prisma.sql` AND i.fecha_actividad >= ${from}` : Prisma.empty}
    ${to ? Prisma.sql` AND i.fecha_actividad <= ${to}` : Prisma.empty}
  GROUP BY DATE_FORMAT(i.fecha_actividad, '%Y-%m-%d')
  ORDER BY DATE_FORMAT(i.fecha_actividad, '%Y-%m-%d') ASC
`;


    return this.prisma.$queryRaw<SerieItem[]>(query);
  }

  private async getEgreso(q: RangeQueryDto): Promise<SerieItem[]> {
    const from = this.toDateOrNull(q.from);
    const to = this.toDateOrNull(q.to);

    const where = Prisma.sql`
      e.anulado = false
      ${from ? Prisma.sql` AND e.fecha_actividad >= ${from}` : Prisma.empty}
      ${to ? Prisma.sql` AND e.fecha_actividad <= ${to}` : Prisma.empty}
    `;

    const query = Prisma.sql`
  SELECT
    DATE_FORMAT(e.fecha_actividad, '%Y-%m-%d') AS fecha_actividad,
    SUM(e.cantidad) AS cantidad
  FROM egreso e
  WHERE
    e.anulado = false
    ${from ? Prisma.sql` AND e.fecha_actividad >= ${from}` : Prisma.empty}
    ${to ? Prisma.sql` AND e.fecha_actividad <= ${to}` : Prisma.empty}
  GROUP BY DATE_FORMAT(e.fecha_actividad, '%Y-%m-%d')
  ORDER BY DATE_FORMAT(e.fecha_actividad, '%Y-%m-%d') ASC
`;

    const data = await this.prisma.$queryRaw<SerieItem[]>(query);
    // Mantener egreso en negativo para balance directo
    return data.map((item) => ({ ...item, cantidad: item.cantidad * -1 }));
  }

  async getTotalesGlobales(q: RangeQueryDto) {
    const from = this.toDateOrNull(q.from);
    const to = this.toDateOrNull(q.to);

    // Si quieres totales globales de tablas "total_ingreso/total_egreso" ignora rango y usa findFirst.
    // Aquí calculo por rango directo desde ingreso/egreso (anulados excluidos).
    const [sumIngreso, sumEgreso] = await Promise.all([
      this.prisma.ingreso.aggregate({
        _sum: { cantidad: true },
        where: {
          anulado: false,
          ...(from ? { fecha_actividad: { gte: from } } : {}),
          ...(to ? { fecha_actividad: { lte: to } } : {}),
        },
      }),
      this.prisma.egreso.aggregate({
        _sum: { cantidad: true },
        where: {
          anulado: false,
          ...(from ? { fecha_actividad: { gte: from } } : {}),
          ...(to ? { fecha_actividad: { lte: to } } : {}),
        },
      }),
    ]);

    // egreso en positivo aquí, para la UI restamos en el front o devolvemos ya como positivo
    const ingreso = Number(sumIngreso._sum.cantidad ?? 0);
    const egreso = Number(sumEgreso._sum.cantidad ?? 0);

    return { ingreso, egreso };
  }

  async countTransacciones(q: RangeQueryDto) {
    const from = this.toDateOrNull(q.from);
    const to = this.toDateOrNull(q.to);

    const [cIngreso, cEgreso] = await Promise.all([
      this.prisma.ingreso.count({
        where: {
          anulado: false,
          ...(from ? { fecha_actividad: { gte: from } } : {}),
          ...(to ? { fecha_actividad: { lte: to } } : {}),
        },
      }),
      this.prisma.egreso.count({
        where: {
          anulado: false,
          ...(from ? { fecha_actividad: { gte: from } } : {}),
          ...(to ? { fecha_actividad: { lte: to } } : {}),
        },
      }),
    ]);

    return cIngreso + cEgreso;
  }
}
