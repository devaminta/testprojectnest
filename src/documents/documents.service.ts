import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  DeleteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { Inject, Injectable } from '@nestjs/common';
import { DYNAMODB_CLIENT } from 'src/database/dynamodb.module';
import { CreateDocumentDto } from './dto/create-document.dto';
import { v4 as uuid } from 'uuid';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  private tableName = 'Documents';
  constructor(
    @Inject(DYNAMODB_CLIENT) private readonly db: DynamoDBDocumentClient,
  ) {}

  async create(createDto: CreateDocumentDto, ownerId: string) {
    const id = uuid();
    const now = new Date().toISOString();
    const item = {
      id,
      title: createDto.title,
      content: createDto.content,
      ownerId,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.send(
      new PutCommand({
        TableName: this.tableName,
        Item: item,
      }),
    );

    return item;
  }

  async findAll(user: { id: string; role: string }) {
    const data = await this.db.send(
      new ScanCommand({
        TableName: this.tableName,
      }),
    );
    if (user.role === 'admin') {
      return data.Items;
    } else {
      return (data.Items || []).filter((item) => item.ownerId === user.id);
    }
  }

  async findOne(id: string, user: { id: string; role: string }) {
    const res = await this.db.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
      }),
    );

    const doc = res.Item;
    if (!doc) {
      throw new Error('Document not found');
    }
    if (user.role !== 'admin' && doc.ownerId !== user.id) {
      throw new Error('Unauthorized');
    }
    return doc;
  }

  async update(
    id: string,
    dto: UpdateDocumentDto,
    user: { id: string; role: string },
  ) {
    const existing = await this.findOne(id, user);
    if (!existing) {
      throw new Error('Document not found');
    }
    const updatedDoc = {
      ...existing,
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    await this.db.send(
      new PutCommand({
        TableName: this.tableName,
        Item: updatedDoc,
      }),
    );

    return updatedDoc;
  }
  async remove(id: string, user: { id: string; role: string }) {
    if (user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    await this.db.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { id },
      }),
    );
    return { message: 'Document deleted successfully' };
  }
}
