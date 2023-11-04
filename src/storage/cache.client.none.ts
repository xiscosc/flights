import { CacheClientInterface } from './cache.client.interface';

export class CacheClientNone implements CacheClientInterface {
  public async store(key: string, data: string, ttl: number) {
    return;
  }

  public async get(key: string): Promise<string | null> {
    return null;
  }
}
