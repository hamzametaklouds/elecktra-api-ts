import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { ToolsModel } from './tools.model';
import { ToolsController } from './tools.controller';
import { ToolsService } from './tools.service';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
  ],
  controllers: [ToolsController],
  providers: [ToolsService, ...ToolsModel],
  exports: [ToolsService]
})
export class ToolsModule {}