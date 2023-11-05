import { Injectable } from '@nestjs/common';
import { Flight } from '../model/flight.model';
import { FlightProviderInterface } from '../provider/flight.provider.interface';
import { ConfigService } from '@nestjs/config';
import { UrlFlightProvider } from '../provider/url-flight.provider';
import { CacheClientFactory } from '../../storage/cache.client.factory';
import { CacheClientInterface } from '../../storage/cache.client.interface';
import { ProviderConfig, ProviderType } from '../model/provider-config.model';

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
    const configs = this.configService.get<ProviderConfig[]>(
      'providerConfigurations',
      [],
    );
    configs.forEach((c) => {
      switch (c.type) {
        case ProviderType.URL:
          this.providers.push(
            new UrlFlightProvider(c.url, c.timeout, c.cacheKey, c.cacheTime),
          );
          break;
        default:
          break;
      }
    });
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
