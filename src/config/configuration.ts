import * as crypto from 'crypto';
import {
  ProviderConfig,
  ProviderType,
} from '../flights/model/provider-config.model';

export default () => ({
  providerConfigurations: createUrlProviderConfigurations(),
  cacheType: getFromEnv('CACHE_TYPE'),
});

function getFromEnv(key: string): string {
  if (process.env[key] !== undefined) {
    return process.env[key]!;
  }
  throw Error(`Undefined env ${key}`);
}

function createUrlProviderConfigurations(): ProviderConfig[] {
  const timeout = +getFromEnv('DEFAULT_PROVIDER_TIMEOUT');
  const cacheTime = +getFromEnv('DEFAULT_PROVIDER_CACHE_TIME');
  const urls = getFromEnv('FLIGHT_PROVIDER_URLS').split(',');
  return urls.map((u) => ({
    url: u,
    type: ProviderType.URL,
    timeout,
    cacheTime,
    cacheKey: crypto.createHash('sha1').update(u, 'utf8').digest('hex'),
  }));
}
