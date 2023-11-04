import { createClient } from 'redis';
import { CacheClientInterface } from './cache.client.interface';

export type RedisClient = ReturnType<typeof createClient>;

export class CacheClientRedis implements CacheClientInterface {
  private redisClient: RedisClient;

  private async getClient(): Promise<RedisClient | undefined> {
    try {
      if (!this.redisClient) {
        this.redisClient = createClient({
          socket: {
            timeout: 100,
            reconnectStrategy: false,
          },
        });
        this.redisClient.on('error', (err) =>
          console.log('Redis Client Error', err),
        );
        await this.redisClient.connect();
      } else if (!this.redisClient.isOpen) {
        await this.redisClient.connect();
      }
    } catch (e) {
      console.error(`Error creating cache client ${e}`);
    }

    return this.redisClient;
  }

  public async store(key: string, data: string, ttl: number) {
    const client = await this.getClient();
    if (client) {
      try {
        await client.set(key, data, { EX: ttl });
      } catch (e) {
        console.error(`Redis cache error ${e}`);
      }
    }
  }

  public async get(key: string): Promise<string | null> {
    const client = await this.getClient();
    if (client) {
      try {
        return await client.get(key);
      } catch (e) {
        console.error(`Redis cache error ${e}`);
      }
    }
    return null;
  }
}
