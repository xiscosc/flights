import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { FlightService } from './service/flight.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { CacheClientFactory } from './storage/cache.client.factory';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      load: [configuration],
    }),
  ],
  controllers: [AppController],
  providers: [FlightService, CacheClientFactory],
})
export class AppModule {}
