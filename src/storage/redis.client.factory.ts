import { Injectable } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
@Injectable()
export class RedisClient {
  private client : RedisClientType | null = null;



  private async function getClient(): RedisClientType {
    if (this.client === null) {
      
    }

    return this.client
  }
}