import { Flight, FlightData } from '../model/flight.model';
import axios from 'axios';
import { FlightsProvider } from './flights.provider.interface';
import {
  GlobalProviderConfig,
  UrlProviderConfig,
} from '../model/configuration.model';

export class PowerUs1Provider implements FlightsProvider {
  constructor(
    private globalConfig: GlobalProviderConfig,
    private providerConfig: UrlProviderConfig,
  ) {}
  async getFlights(): Promise<Flight[]> {
    try {
      const response = await axios.get<FlightData>(this.providerConfig.url, {
        timeout: this.globalConfig.defaultTimeout,
      });
      return response.data.flights;
    } catch (e) {
      console.error(`PowerUs1 Provider - ${e.message}`);
      return [];
    }
  }
}
