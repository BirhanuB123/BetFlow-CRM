import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { InMemoryService, Note } from '../database/in-memory.service';

type CreateNoteBody = Omit<Note, 'id' | 'createdAt'>;

@Controller('notes')
export class NotesController {
  constructor(private readonly store: InMemoryService) {}

  @Get()
  list(@Query('tenantId') tenantId?: string) {
    return this.store.listNotes(tenantId);
  }

  @Post()
  create(@Body() body: CreateNoteBody) {
    return this.store.createNote(body);
  }
}
