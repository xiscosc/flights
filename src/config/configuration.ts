export default () => ({
  providerConfigurations: {
    powerUs1: {
      url: getFromEnv('POWER_US_1_URL'),
      timeout: +getFromEnv('DEFAULT_PROVIDER_TIMEOUT'),
      cacheTime: +getFromEnv('DEFAULT_PROVIDER_CACHE_TIME'),
      cacheKey: getFromEnv('POWER_US_1_CACHE_KEY'),
    },
    powerUs2: {
      url: getFromEnv('POWER_US_2_URL'),
      timeout: +getFromEnv('DEFAULT_PROVIDER_TIMEOUT'),
      cacheTime: +getFromEnv('DEFAULT_PROVIDER_CACHE_TIME'),
      cacheKey: getFromEnv('POWER_US_2_CACHE_KEY'),
    },
  },

  cacheType: getFromEnv('CACHE_TYPE'),
});

function getFromEnv(key: string): string {
  if (process.env[key] !== undefined) {
    return process.env[key]!;
  }
  throw Error(`Undefined env ${key}`);
}
