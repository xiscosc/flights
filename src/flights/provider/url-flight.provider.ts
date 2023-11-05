import { Flight, FlightData } from '../model/flight.model';
import { FlightProviderInterface } from './flight.provider.interface';
import { CacheClientInterface } from '../../storage/cache.client.interface';
import axios from 'axios';

export class UrlFlightProvider implements FlightProviderInterface {
  constructor(
    private url: string,
    private timeout: number,
    private cacheKey: string,
    private cacheTtl: number,
  ) {}

  async getFlights(cacheClient: CacheClientInterface): Promise<Flight[]> {
    const cachedFlights = await this.getFlightsFromCache(cacheClient);
    if (cachedFlights) return cachedFlights;

    const downloadedFlights = await this.getFlightsFromUrl();
    await this.cacheFlights(downloadedFlights, cacheClient);
    return downloadedFlights;
  }

  private async getFlightsFromCache(
    cacheClient: CacheClientInterface,
  ): Promise<Flight[] | null> {
    try {
      const cacheResult = await cacheClient.get(this.cacheKey);
      if (cacheResult) return JSON.parse(cacheResult) as Flight[];
    } catch (e) {
      console.error(
        `Cache error - URL Provider (url: ${this.url}) - ${e.message}`,
      );
    }
    return null;
  }

  private async getFlightsFromUrl(): Promise<Flight[]> {
    let flights: Flight[] = [];
    try {
      const response = await axios.get<FlightData>(this.url, {
        timeout: this.timeout,
      });
      flights = response?.data?.flights ?? [];
    } catch (e) {
      console.error(`URL Provider (url: ${this.url}) - ${e.message}`);
    }
    return flights;
  }

  private async cacheFlights(
    flights: Flight[],
    cacheClient: CacheClientInterface,
  ) {
    if (flights.length === 0) return;
    try {
      await cacheClient.store(
        this.cacheKey,
        JSON.stringify(flights),
        this.cacheTtl,
      );
    } catch (e) {
      console.error(
        `Store cache - URL Provider (url: ${this.url}) - ${e.message}`,
      );
    }
  }
}
