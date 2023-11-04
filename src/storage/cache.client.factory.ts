import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheClientInterface } from './cache.client.interface';
import { CacheClientRedis } from './cache.client.redis';
import { CacheClientNone } from './cache.client.none';

enum CacheType {
  REDIS = 'REDIS',
  NONE = 'NONE',
}

@Injectable()
export class CacheClientFactory {
  private cacheClient?: CacheClientInterface;

  constructor(private configService: ConfigService) {}

  getClient(): CacheClientInterface {
    if (this.cacheClient) return this.cacheClient;

    const type = this.configService.get<string>('cacheType', 'NONE');
    switch (type) {
      case CacheType.REDIS: {
        this.cacheClient = new CacheClientRedis();
        console.log('Redis cache client created');
        break;
      }
      default: {
        this.cacheClient = new CacheClientNone();
        console.log('No configured cache');
        break;
      }
    }

    return this.cacheClient;
  }
}
