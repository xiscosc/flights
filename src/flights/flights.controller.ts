import { Controller, Get } from '@nestjs/common';
import { FlightService } from './service/flight.service';
import { FlightData } from './model/flight.model';

@Controller('flights')
export class FlightsController {
  constructor(private readonly flightService: FlightService) {}

  @Get()
  async getFlights(): Promise<FlightData> {
    return { flights: await this.flightService.getFlights() };
  }
}
