import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}