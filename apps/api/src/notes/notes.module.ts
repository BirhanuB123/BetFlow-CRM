import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { NotesController } from './notes.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [NotesController],
})
export class NotesModule {}
