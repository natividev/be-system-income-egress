import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { FiltrosProductoDto } from './dto/filtros-producto.dto';
import { PaginationDto } from './dto/pagination.dto';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) { }

  // POST /inventory/productos
  @Post('productos')
  crearProducto(@Body() dto: CreateInventoryDto) {
    return this.inventoryService.crearProducto(dto);
  }

  // GET /inventory/productos?q=...&id_categoria=...&id_unidad_medida=...&activo=...&offset=0&limit=20
  @Get('productos')
  listarProductos(@Query() filtros: FiltrosProductoDto) {
    return this.inventoryService.listarProductos(filtros);
  }

  // GET /inventory/productos/:id_producto
  @Get('productos/:id_producto')
  obtenerProducto(@Param('id_producto', ParseIntPipe) id_producto: number) {
    return this.inventoryService.obtenerProducto(id_producto);
  }

  // PATCH /inventory/productos/:id_producto
  @Patch('productos/:id_producto')
  actualizarProducto(
    @Param('id_producto', ParseIntPipe) id_producto: number,
    @Body() dto: UpdateInventoryDto,
  ) {
    return this.inventoryService.actualizarProducto(id_producto, dto);
  }

  // PATCH /inventory/productos/:id_producto/desactivar
  @Patch('productos/:id_producto/desactivar')
  desactivarProducto(@Param('id_producto', ParseIntPipe) id_producto: number) {
    return this.inventoryService.desactivarProducto(id_producto);
  }

  // ========= MOVIMIENTOS =========

  // POST /inventory/movimientos
  @Post('movimientos')
  crearMovimiento(@Body() dto: CreateMovimientoDto) {
    return this.inventoryService.crearMovimiento(dto);
  }

  // GET /inventory/productos/:id_producto/movimientos?offset=0&limit=20
  @Get('productos/:id_producto/movimientos')
  listarMovimientosPorProducto(
    @Param('id_producto', ParseIntPipe) id_producto: number,
    @Query() pag: PaginationDto,
  ) {
    const { offset = 0, limit = 20 } = pag || {};
    return this.inventoryService.listarMovimientosPorProducto(
      id_producto,
      offset,
      limit,
    );
  }
}
