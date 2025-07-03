import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('documents')
@UseGuards(AuthGuard)
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  private getUser(req): { id: string; role: string } {
    return {
      id: req.headers['x-user-id'],
      role: req.headers['x-user-role'] || 'User',
    };
  }

  @Post()
  create(@Body() dto: CreateDocumentDto, @Req() req) {
    const user = this.getUser(req);
    return this.service.create(dto, user.id);
  }

  @Get()
  findAll(@Req() req) {
    const user = this.getUser(req);
    return this.service.findAll(user);
  }

  @Get(':id')
  findOne(@Req() req, @Param('id') id: string) {
    const user = this.getUser(req);
    return this.service.findOne(id, user);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDocumentDto, @Req() req) {
    const user = this.getUser(req);
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    const user = this.getUser(req);
    return this.service.remove(id, user);
  }
}
