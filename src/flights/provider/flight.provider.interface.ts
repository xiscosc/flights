import { CacheClientInterface } from 'src/storage/cache.client.interface';
import { Flight } from '../model/flight.model';

export interface FlightProviderInterface {
  getFlights(cacheClient?: CacheClientInterface): Promise<Flight[]>;
}
