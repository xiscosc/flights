import { Test, TestingModule } from '@nestjs/testing';
import { FlightsController } from './flights.controller';
import { FlightService } from './service/flight.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { flight1, flight2, flight3 } from './test-helper/flight.mock';

describe('FlightsController', () => {
  let appController: FlightsController;
  let flightService: DeepMocked<FlightService>;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FlightsController],
      providers: [
        {
          provide: FlightService,
          useValue: createMock<FlightService>(),
        },
      ],
    }).compile();

    flightService = app.get(FlightService);
    appController = app.get<FlightsController>(FlightsController);
  });

  describe('flights controller', () => {
    it('should return flights', async () => {
      const flights = [flight1, flight2, flight3];
      flightService.getFlights.mockResolvedValueOnce(flights);
      expect(await appController.getFlights()).toStrictEqual({
        flights: flights,
      });
    });
  });
});
