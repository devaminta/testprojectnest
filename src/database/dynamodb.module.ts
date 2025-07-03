import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

export const DYNAMODB_CLIENT = 'DYNAMODB_CLIENT';
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DYNAMODB_CLIENT,
      inject: [ConfigService],
      useFactory: () => {
        const client = new DynamoDBClient({
          region: process.env.AWS_REGION || 'us-east-1',
          credentials: {
            accessKeyId: process.env.ACCESS_KEY || '',
            secretAccessKey: process.env.SECRET_KEY || '',
          },
        });
        return DynamoDBDocumentClient.from(client);
      },
    },
  ],
  exports: [DYNAMODB_CLIENT],
})
export class DynamoDBModule {}
