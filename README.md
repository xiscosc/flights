# Flights API

### Project Structure

#### Flights Module
- **FlightsController**: Controller with the required endpoint for retrieving the flights: ```/flights```

- **FlightService**: Creates all flight providers from configuration and process all responses from them, merging the 
results and removing duplicates.

- **FlightProvider**: Gets flights from a source and caches it for next requests if it is possible. For this exercise,
only a _UrlFlightProvider_ has been implemented. 
  - The _UrlFlightProvider_ class gets the data from a URL and caches it, if the remote endpoint fails
or times out it returns an empty response. When a response is successful, it caches the results. Next
time, if cache is available it does not pull from the url and returns the content of the cache directly.

#### Storage
A _CacheClientFactory_ class has been implemented, depending on the configuration it will return a client for
the selected storage. For this exercise only a Redis client and a None client have been implemented. The none client
basically does nothing but allows other methods that rely on having a cache client to be used if a cache storage
is not available.

The _CacheClient_ has been design to handle errors gracefully. If the cache server becomes unavailable, it will try
to reconnect the next time it's needed.

#### Environment
A `.env` file has been created at the root of the project. NestJS automatically reads it and it has been mapped to
a configuration file in `src/config/configuration.ts`.

The `.env` file contains the URLS of the providers in a comma separated list, default values for timeouts and caching,
and the type of cache to use (`REDIS|NONE`).

The default value of the timeout for the urls has been set to `900ms` since the service has always to answer in `1s`
and a margin of `100ms` has been left for processing the results of the flights urls.

## Run
### How to run it
Before running it, the cache server has to be up and running:
```
docker run -p 6379:6379 -it redis/redis-stack-server:latest
```

If you don't want to use the cache, you can change the `.env` file property to `CACHE_TYPE=NONE`

Start the server:
```
npm run start
```

Make a call to `GET http://localhost:3000/flights`


### How to add more providers
If there are new urls, add them to the env file and the `FlightService` will gather them automatically.
For new kind of providers, a new class implementing the `FlightProviderInterface` has to bee created and added to the
`FlightService`.

## Test

### How to test it
#### Unit tests
Those are unit tests that for the FlightService, FlightProviders, and FlightController

```npm run test```

#### E2E tests
Those integration tests, call the service directly. A wiremock server has been configured to
control the remote urls and to be able to cause errors and timeouts. Before running the test,
a wiremock server has to be started.

Tests check complete functionality of the endpoint including cases when the urls timeout, return errors or
duplicated flights. They also check that the endpoint always returns in less than `1s`.

```
docker run -itd --rm --name wiremock-container -p 8080:8080 wiremock/wiremock:2.32.0 --record-mappings --verbose
npm run test:e2e
```
