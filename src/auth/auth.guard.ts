import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import axios from 'axios';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'] as string;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token or invalid token provided');
    }
    const token = authHeader.split(' ')[1];

    try {
      const response = await axios.get(
        'https://localhost:1080/token/validate',
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      request['user'] = response.data as any; 

      return true;
    } catch (error) {
      console.log('Authentication error:', error);
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
