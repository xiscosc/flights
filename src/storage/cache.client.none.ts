import { CacheClientInterface } from './cache.client.interface';

export class CacheClientNone implements CacheClientInterface {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async store(key: string, data: string, ttl: number) {
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async get(key: string): Promise<string | null> {
    return null;
  }
}
