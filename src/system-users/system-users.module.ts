import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from 'src/database/database.module';
import { SystemUsersController } from './system-users.controller';
import { SystemUsersModel } from './system-users.model';
import { SystemUsersService } from './system-users.service';

@Module({
  imports:[DatabaseModule,ConfigModule],
  controllers: [SystemUsersController],
  providers: [SystemUsersService,...SystemUsersModel],
  exports:[SystemUsersService]
})
export class SystemUsersModule {}
