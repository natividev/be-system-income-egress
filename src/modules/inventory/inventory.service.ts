import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { PrismaService } from 'src/prisma.service';
import { Prisma, tipo_movimiento } from '@prisma/client';
import { FiltrosProductoDto } from './dto/filtros-producto.dto';
import { CreateMovimientoDto, TipoMovimiento } from './dto/create-movimiento.dto';

@Injectable()
export class InventoryService {

  constructor(private readonly prisma: PrismaService) { }

  // ========== PRODUCTOS ==========
  async crearProducto(dto: CreateInventoryDto) {
    try {
      const data: Prisma.productoCreateInput = {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        codigo_barra: dto.codigo_barra ?? null,
        precio_unitario: new Prisma.Decimal(dto.precio_unitario),
        stock_actual: dto.stock_actual ?? 0,
        activo: dto.activo ?? true,
        categoria: { connect: { id: dto.id_categoria } },
        unidad_medida: { connect: { id: dto.id_unidad_medida } },
      };

      return await this.prisma.producto.create({ data });
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException('El código de barras o SKU ya existe.');
      }
      throw e;
    }
  }

  async listarProductos(filtros: FiltrosProductoDto) {
    const { offset = 0, limit = 20, q, id_categoria, id_unidad_medida, activo } = filtros;

    const where: Prisma.productoWhereInput = {
      AND: [
        q
          ? {
            OR: [
              { nombre: { contains: q } },
              { codigo_barra: { contains: q } },
            ],
          }
          : {},
        id_categoria ? { id_categoria } : {},
        id_unidad_medida ? { id_unidad_medida } : {},
        typeof activo === 'boolean' ? { activo } : {},
      ],
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.producto.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          categoria: true,
          unidad_medida: true,
        },
      }),
      this.prisma.producto.count({ where }),
    ]);

    return { total, items };
  }

  async listarProductosSelect() {
    return await this.prisma.producto.findMany();
  }


  async obtenerProducto(id_producto: number) {
    const producto = await this.prisma.producto.findUnique({
      where: { id: id_producto },
      include: { categoria: true, unidad_medida: true },
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  async actualizarProducto(id_producto: number, dto: UpdateInventoryDto) {
    await this.obtenerProducto(id_producto);
    try {
      return await this.prisma.producto.update({
        where: { id: id_producto },
        data: {
          ...dto,
          precio_unitario: dto.precio_unitario !== undefined
            ? new Prisma.Decimal(dto.precio_unitario)
            : undefined,
        },
      });
    } catch (e: any) {
      if (e.code === 'P2002') {
        throw new ConflictException('El código de barras ya existe.');
      }
      throw e;
    }
  }

  async desactivarProducto(id_producto: number) {
    await this.obtenerProducto(id_producto);
    return this.prisma.producto.update({
      where: { id: id_producto },
      data: { activo: false },
    });
  }

  // ========== MOVIMIENTOS ==========
  /**
   * Crea un movimiento (entrada | salida | ajuste) y actualiza stock_actual de producto.
   * - Valida que la salida no deje stock negativo.
   * - Usa transacción para consistencia.
   */
  async crearMovimiento(dto: CreateMovimientoDto) {
    const { id, cantidad, tipo } = dto;

    if (cantidad <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor que 0.');
    }

    const tipoMoviento = await this.prisma.tipo_movimientos.findFirst({
      where: {
        id: tipo
      }
    })

    if (!['entrada', 'salida', 'ajuste'].includes(tipoMoviento.nombre)) {
      throw new BadRequestException('Tipo de movimiento inválido');
    }

    return await this.prisma.$transaction(async (tx) => {
      const producto = await tx.producto.findUnique({ where: { id: id } });
      if (!producto) throw new NotFoundException('Producto no encontrado');

      let nuevoStock = producto.stock_actual;

      switch (tipoMoviento.nombre as tipo_movimiento) {
        case TipoMovimiento.entrada:
          nuevoStock = producto.stock_actual + cantidad;
          break;

        case TipoMovimiento.salida:
          if (producto.stock_actual < cantidad) {
            throw new BadRequestException('Stock insuficiente para salida.');
          }
          nuevoStock = producto.stock_actual - cantidad;
          break;

        case TipoMovimiento.ajuste:
          // Ajuste se interpreta como set (+/-) respecto a conteo físico:
          // aquí lo tratamos como "diferencia" a aplicar: si dto.cantidad es positiva => suma; negativa => resta.
          // Como el DTO exige positiva, usamos observacion para contexto y sumamos/restamos con una bandera.
          // Si prefieres ajuste por “delta” explícito, convierte CreateMovimientoDto.cantidad a número con signo.
          // Por ahora lo manejamos como "entrada de ajuste".
          nuevoStock = producto.stock_actual + cantidad;
          break;
      }

      // seguridad adicional (por si ajuste pudiera restar en tu lógica)
      if (nuevoStock < 0) {
        throw new BadRequestException('El ajuste resultaría en stock negativo.');
      }

      // 1) Crear movimiento
      const movimiento = await tx.movimiento.create({
        data: {
          tipo: tipoMoviento.nombre as tipo_movimiento,
          cantidad,
          referencia: dto.referencia ?? null,
          observacion: dto.observacion ?? null,
          producto: { connect: { id } },
          usuario: { connect: { id: dto.id_usuario } }, // ajusta si tu modelo es "usuario" con id_usuario
        },
      });

      // 2) Actualizar stock del producto
      await tx.producto.update({
        where: { id },
        data: { stock_actual: nuevoStock },
      });

      return movimiento;
    });
  }

  async listarMovimientosPorProducto(id_producto: number, offset = 0, limit = 20) {
    await this.obtenerProducto(id_producto);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.movimiento.findMany({
        where: { id_producto: id_producto },
        orderBy: { fecha: 'desc' },
      }),
      this.prisma.movimiento.count({ where: { id_producto } }),
    ]);
    return { total, items };
  }


}
