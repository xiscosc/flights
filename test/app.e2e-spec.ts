import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import configuration from '../src/config/configuration';
import { AppController } from '../src/app.controller';
import { FlightService } from '../src/service/flight.service';
import { CacheClientFactory } from '../src/storage/cache.client.factory';
import {
  DelayType,
  IWireMockRequest,
  IWireMockResponse,
  WireMock,
} from 'wiremock-captain';
import { flight1, flight2, flight3 } from '../src/test-helper/flight.mock';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const wiremockEndpoint = 'http://localhost:8080';
  const powerUsMock = new WireMock(wiremockEndpoint);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.test.env',
          load: [configuration],
        }),
      ],
      controllers: [AppController],
      providers: [FlightService, CacheClientFactory],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('Gets flights from both urls', async () => {
    const request1: IWireMockRequest = {
      method: 'GET',
      endpoint: '/flights1',
    };
    const request2: IWireMockRequest = {
      method: 'GET',
      endpoint: '/flights2',
    };

    const response1: IWireMockResponse = {
      status: 200,
      body: { flights: [flight1, flight3] },
    };

    const response2: IWireMockResponse = {
      status: 200,
      body: { flights: [flight1, flight2] },
    };

    await powerUsMock.register(request1, response1);
    await powerUsMock.register(request2, response2);

    return request(app.getHttpServer())
      .get('/')
      .timeout(1000)
      .expect(200)
      .expect({ flights: [flight1, flight3, flight2] });
  });

  it('One url times out but it returns in less than a second', async () => {
    const request1: IWireMockRequest = {
      method: 'GET',
      endpoint: '/flights1',
    };
    const request2: IWireMockRequest = {
      method: 'GET',
      endpoint: '/flights2',
    };

    const response1: IWireMockResponse = {
      status: 200,
      body: { flights: [flight1] },
    };

    const response2: IWireMockResponse = {
      status: 200,
      body: { flights: [flight2] },
    };

    await powerUsMock.register(request1, response1, {
      responseDelay: {
        type: DelayType.FIXED,
        constantDelay: 1500,
      },
    });
    await powerUsMock.register(request2, response2, {
      responseDelay: {
        type: DelayType.FIXED,
        constantDelay: 700,
      },
    });

    return request(app.getHttpServer())
      .get('/')
      .timeout(1000)
      .expect(200)
      .expect({ flights: [flight2] });
  });

  it('One url fails', async () => {
    const request1: IWireMockRequest = {
      method: 'GET',
      endpoint: '/flights1',
    };
    const request2: IWireMockRequest = {
      method: 'GET',
      endpoint: '/flights2',
    };

    const response1: IWireMockResponse = {
      status: 500,
      body: { error: 'error' },
    };

    const response2: IWireMockResponse = {
      status: 200,
      body: { flights: [flight2] },
    };

    await powerUsMock.register(request1, response1);
    await powerUsMock.register(request2, response2);

    return request(app.getHttpServer())
      .get('/')
      .timeout(1000)
      .expect(200)
      .expect({ flights: [flight2] });
  });
});
