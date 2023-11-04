import { UrlFlightsProvider } from './url.flights.provider';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { CacheClientInterface } from '../storage/cache.client.interface';
import axios from 'axios';
import { flight1 } from '../test-helpers/flight.mock';
jest.mock('axios');

describe('Url flight provider', () => {
  let cacheClient: DeepMocked<CacheClientInterface>;
  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(async () => {
    jest.clearAllMocks();
    cacheClient = createMock<CacheClientInterface>();
  });

  test('Results are cached', async () => {
    const provider = new UrlFlightsProvider('', 1, 'key1', 1);
    cacheClient.get.mockResolvedValue('[]');
    expect(await provider.getFlights(cacheClient)).toEqual([]);
    expect(axios.get).toBeCalledTimes(0);
  });

  test('Results are not cached, url is called', async () => {
    const provider = new UrlFlightsProvider('', 1, 'key1', 1);
    cacheClient.get.mockResolvedValue(null);
    mockedAxios.get.mockResolvedValue({ data: { flights: [flight1] } });
    expect(await provider.getFlights(cacheClient)).toEqual([flight1]);
    expect(axios.get).toBeCalledTimes(1);
    expect(cacheClient.store).toBeCalledWith(
      'key1',
      JSON.stringify([flight1]),
      1,
    );
  });

  test('Cache fails, url is called', async () => {
    const provider = new UrlFlightsProvider('', 1, 'key1', 1);
    cacheClient.get.mockRejectedValue(Error('Testing error'));
    mockedAxios.get.mockResolvedValue({ data: { flights: [flight1] } });
    expect(await provider.getFlights(cacheClient)).toEqual([flight1]);
    expect(axios.get).toBeCalledTimes(1);
    expect(cacheClient.store).toBeCalledWith(
      'key1',
      JSON.stringify([flight1]),
      1,
    );
  });

  test('Cache fails, url call fails', async () => {
    const provider = new UrlFlightsProvider('', 1, 'key1', 1);
    cacheClient.get.mockRejectedValue(Error('Testing error'));
    mockedAxios.get.mockRejectedValue(Error('Testing error'));
    expect(await provider.getFlights(cacheClient)).toEqual([]);
    expect(axios.get).toBeCalledTimes(1);
  });
});
