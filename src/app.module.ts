import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IngresoModule } from './modules/ingreso/ingreso.module';
import { TipoIngresoModule } from './modules/tipo-ingreso/tipo-ingreso.module';
import { TipoControlModule } from './modules/tipo-control/tipo-control.module';
import { TipoAportacionModule } from './modules/tipo-aportacion/tipo-aportacion.module';
import { EgresoModule } from './modules/egreso/egreso.module';
import { ReportsModule } from './modules/reports/reports.module';
import { GeneralesModule } from './modules/generales/generales.module';
import { AfiliadosModule } from './modules/afiliados/afiliados.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ProyectoModule } from './modules/proyecto/proyecto.module';
import { TipoParticipanteModule } from './modules/tipo-participante/tipo-participante.module';
import { BitacoraAportacionModule } from './modules/bitacora-aportacion/bitacora-aportacion.module';
import { CategoriaProyectoModule } from './modules/categoria-proyecto/categoria-proyecto.module';
import { AnulacionModule } from './modules/anulacion/anulacion.module';
import { TimelineModule } from './modules/timeline/timeline.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { InventoryModule } from './modules/inventory/inventory.module';

@Module({
  imports: [
    IngresoModule,
    TipoIngresoModule,
    TipoControlModule,
    TipoAportacionModule,
    EgresoModule,
    ReportsModule,
    GeneralesModule,
    AfiliadosModule,
    DashboardModule,
    ProyectoModule,
    TipoParticipanteModule,
    BitacoraAportacionModule,
    CategoriaProyectoModule,
    AnulacionModule,
    TimelineModule,
    AuthModule,
    InventoryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
