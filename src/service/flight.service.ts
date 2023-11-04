import { Injectable } from '@nestjs/common';
import { Flight } from '../model/flight.model';
import { FlightProviderInterface } from '../provider/flight.provider.interface';
import { ConfigService } from '@nestjs/config';
import { UrlProviderConfig } from '../model/configuration.model';
import { CacheClientFactory } from '../storage/cache.client.factory';
import { UrlFlightProvider } from '../provider/url-flight.provider';
import { CacheClientInterface } from '../storage/cache.client.interface';

@Injectable()
export class FlightService {
  private providers: FlightProviderInterface[];
  private readonly cacheClient: CacheClientInterface;

  constructor(
    private configService: ConfigService,
    private cacheClientFactory: CacheClientFactory,
  ) {
    this.providers = [];
    this.initProviders();
    this.cacheClient = this.cacheClientFactory.getClient();
  }

  async getFlights(): Promise<Flight[]> {
    const responses = await Promise.all(
      this.providers.map((provider) => provider.getFlights(this.cacheClient)),
    );
    return this.mergeFlightResponses(responses);
  }

  private initProviders() {
    // Add here all your flight providers
    const url1Config = this.configService.get<UrlProviderConfig>(
      'providerConfigurations.powerUs1',
    );
    if (url1Config) {
      this.providers.push(
        new UrlFlightProvider(
          url1Config.url,
          url1Config.timeout,
          url1Config.cacheKey,
          url1Config.cacheTime,
        ),
      );
    }

    const url2Config = this.configService.get<UrlProviderConfig>(
      'providerConfigurations.powerUs2',
    );
    if (url2Config) {
      this.providers.push(
        new UrlFlightProvider(
          url2Config.url,
          url2Config.timeout,
          url2Config.cacheKey,
          url2Config.cacheTime,
        ),
      );
    }
  }

  private mergeFlightResponses(flightResponses: Flight[][]): Flight[] {
    const flightSet = new Set<string>();
    const result: Flight[] = [];

    flightResponses.flat().forEach((flight) => {
      const key = this.getFlightKey(flight);
      if (key !== null && !flightSet.has(key)) {
        result.push(flight);
        flightSet.add(key);
      }
    });
    return result;
  }

  private getFlightKey(flight: Flight): string | null {
    if (flight.slices.length === 0) return null;
    let key = '';
    flight.slices.forEach((s) => {
      key += s.flight_number + '_' + s.departure_date_time_utc + '_';
    });
    return key;
  }
}
