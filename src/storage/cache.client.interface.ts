export interface CacheClientInterface {
  store(key: string, data: string, ttl: number): Promise<void>;
  get(key: string): Promise<string | null>;
}
