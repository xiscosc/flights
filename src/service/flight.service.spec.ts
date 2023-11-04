import { ConfigService } from '@nestjs/config';
import { FlightService } from './flight.service';
import { CacheClientFactory } from '../storage/cache.client.factory';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CacheClientInterface } from '../storage/cache.client.interface';
import { UrlFlightProvider } from '../provider/url-flight.provider';
import { when } from 'jest-when';
import { flight1, flight2, flight3 } from '../test-helper/flight.mock';

jest.mock('../storage/cache.client.interface');
jest.mock('../provider/url.flights.provider');

describe('FlightService', () => {
  let configService: DeepMocked<ConfigService>;
  let cacheClientFactory: DeepMocked<CacheClientFactory>;

  beforeEach(async () => {
    jest.clearAllMocks();
    configService = createMock<ConfigService>();
    cacheClientFactory = createMock<CacheClientFactory>();
  });

  test('Different results from providers', async () => {
    const urlProvider1 = {
      url: '',
      timeout: 1,
      cacheTime: 1,
      cacheKey: 1,
    };

    configService.get
      .mockReturnValueOnce(urlProvider1)
      .mockReturnValueOnce(urlProvider1);
    cacheClientFactory.getClient.mockReturnValueOnce(
      createMock<CacheClientInterface>(),
    );
    when(UrlFlightProvider.prototype.getFlights)
      .mockResolvedValue([flight1])
      .mockResolvedValueOnce([flight2]);

    const flightService = new FlightService(configService, cacheClientFactory);
    const flights = await flightService.getFlights();

    expect(UrlFlightProvider.prototype.getFlights).toHaveBeenCalledTimes(2);
    expect(flights).toEqual([flight2, flight1]);
  });

  test('Merge different results from providers', async () => {
    const urlProvider1 = {
      url: '',
      timeout: 1,
      cacheTime: 1,
      cacheKey: 1,
    };

    configService.get
      .mockReturnValueOnce(urlProvider1)
      .mockReturnValueOnce(urlProvider1);
    cacheClientFactory.getClient.mockReturnValueOnce(
      createMock<CacheClientInterface>(),
    );
    when(UrlFlightProvider.prototype.getFlights)
      .mockResolvedValue([flight3, flight1])
      .mockResolvedValueOnce([flight1, flight2]);

    const flightService = new FlightService(configService, cacheClientFactory);
    const flights = await flightService.getFlights();

    expect(UrlFlightProvider.prototype.getFlights).toHaveBeenCalledTimes(2);
    expect(flights).toEqual([flight1, flight2, flight3]);
  });

  test('No results from flights', async () => {
    const urlProvider1 = {
      url: '',
      timeout: 1,
      cacheTime: 1,
      cacheKey: 1,
    };

    configService.get
      .mockReturnValueOnce(urlProvider1)
      .mockReturnValueOnce(undefined);
    cacheClientFactory.getClient.mockReturnValueOnce(
      createMock<CacheClientInterface>(),
    );
    when(UrlFlightProvider.prototype.getFlights).mockResolvedValue([]);

    const flightService = new FlightService(configService, cacheClientFactory);
    const flights = await flightService.getFlights();

    expect(UrlFlightProvider.prototype.getFlights).toHaveBeenCalledTimes(1);
    expect(flights).toEqual([]);
  });
});
