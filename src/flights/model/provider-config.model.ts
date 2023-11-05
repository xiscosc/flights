export enum ProviderType {
  URL = 'URL',
}

export interface ProviderConfig {
  url: string;
  timeout: number;
  cacheTime: number;
  cacheKey: string;
  type: ProviderType;
}
