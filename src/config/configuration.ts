import * as crypto from 'crypto';
import {
  ProviderConfig,
  ProviderType,
} from '../flights/model/provider-config.model';

export default () => ({
  providerConfigurations: createProviderConfigurations(),
  cacheType: getFromEnv('CACHE_TYPE'),
});

function getFromEnv(key: string): string {
  if (process.env[key] !== undefined) {
    return process.env[key]!;
  }
  throw Error(`Undefined env ${key}`);
}

function createProviderConfigurations(): ProviderConfig[] {
  const timeout = +getFromEnv('DEFAULT_PROVIDER_TIMEOUT');
  const cacheTime = +getFromEnv('DEFAULT_PROVIDER_CACHE_TIME');

  // Add other provider configs here
  const urlProviderConfigs = createUrlProviderConfigurations(
    timeout,
    cacheTime,
  );

  return [...urlProviderConfigs];
}

function createUrlProviderConfigurations(
  timeout: number,
  cacheTime: number,
): ProviderConfig[] {
  const urls = getFromEnv('FLIGHT_PROVIDER_URLS').split(',');
  return urls.map((u) => ({
    url: u,
    type: ProviderType.URL,
    timeout,
    cacheTime,
    cacheKey: crypto.createHash('sha1').update(u, 'utf8').digest('hex'),
  }));
}
