import {
  PutCommand,
  DynamoDBDocumentClient,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly dbClient: DynamoDBDocumentClient) {}

  private readonly tableName = 'Users';
  async createUser(user: {
    fullname: string;
    email: string;
    password: string;
    role: 'User' | 'Admin';
  }) {
    const now = new Date().toISOString();
    const item = {
      ...user,
      createdAt: now,
      updatedAt: now,
    };

    const command = new GetCommand({
      TableName: this.tableName,
      Key: { email: user.email },
    });
    const existingUser = await this.dbClient.send(command);
    if (existingUser.Item) {
      throw new Error('User already exists with this email');
    }

    const passwordHash = await bcrypt.hash(user.password, 10);
    item.password = passwordHash;

    const newUser = {
      fullname: user.fullname,
      email: user.email,
      password: item.password,
      role: user.role || 'User', // Default to 'User' if not provided
    };

    const putCommand = new PutCommand({
      TableName: this.tableName,
      Item: { ...newUser },
    });
    await this.dbClient.send(putCommand);

    return item;
  }
}
