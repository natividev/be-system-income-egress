import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { envs } from 'src/config/envs';
import { PrismaService } from 'src/prisma.service';
import { IIngresoAnalisis } from './interface';
import { currencyAdapter } from 'src/plugins';

@Injectable()
export class GeneralesService {
  constructor(private readonly _prisma: PrismaService) { }

  genAI = new GoogleGenerativeAI(envs.apiKeyGoogleGemini);
  model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async generate() {
    try {
      const ingresos = await this.ingresoAnalisis();

      const prompt = `
        Como modelo de inteligencia artificial, analiza los siguientes registros de transacciones y proporciona un análisis detallado:
        
        Ingresos:
        ${JSON.stringify(ingresos, null, 2)}

        El análisis debe incluir:
        1. Distribución de Transacciones por Categoría y Tipo.
        2. Análisis Temporal.
        3. Análisis de Monto de Transacción.
        4. Identificación de Personas Repetitivas.
        5. Observaciones Textuales.
        6. Resumen General.
      `;

      const response = await this.model.generateContent(prompt);

      const generatedText =
        response?.response?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        return generatedText.trim();
      } else {
        throw new Error('Respuesta generada vacía o inválida');
      }
    } catch (error) {
      throw new Error('Error al generar');
    }
  }
  async tipoDocumento() {
    return await this._prisma.tipo_documento.findMany();
  }

  private async ingresoAnalisis(): Promise<IIngresoAnalisis[]> {
    const query = Prisma.sql`select
      i.nombre_actividad as nombreActividad,
      i.fecha_actividad as fechaActividad,
      i.cantidad as cantidad,
      i.razon,
      i.dui,
      i.observaciones,
      ti.nombre as tipoIngreso,
      tc.nombre as tipoControl,
      ta.nombre as tipoAportacion
    from
      ingreso i
    INNER JOIN tipo_ingreso ti ON
      ti.id  = i.fk_tipo_ingreso
    INNER JOIN tipo_control tc ON
      tc.id = i.fk_tipo_control
    INNER JOIN tipo_aportacion ta ON
      ta.id = i.fk_tipo_aportacion;`;

    return await this._prisma.$queryRaw<IIngresoAnalisis[]>(query);
  }

  async dashboard() {
    const [totalIngreso, totalEgreso] = await Promise.all([
      this.ingresos(),
      this.egresos(),
    ]);

    return {
      ingresos: currencyAdapter.create(totalIngreso.monto).format(),
      egresos: currencyAdapter.create(totalEgreso.monto).format(),
    };
  }

  private async ingresos() {
    return await this._prisma.total_ingreso.findFirst();
  }

  private async egresos() {
    return await this._prisma.total_egreso.findFirst();
  }

  async listarCategorias() {
    return await this._prisma.categoria.findMany({
      select: {
        id: true,
        nombre: true,
        descripcion: true,
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async listarUnidadesMedida() {
    return await this._prisma.unidad_medida.findMany({
      select: {
        id: true,
        nombre: true,
        abreviatura: true,
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async listarTipoMovimiento() {
    return await this._prisma.tipo_movimientos.findMany();
  }
}
