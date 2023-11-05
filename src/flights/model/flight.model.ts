export interface Flight {
  slices: Slice[];
  price: number;
}

export interface Slice {
  origin_name: string;
  destination_name: string;
  departure_date_time_utc: string;
  arrival_date_time_utc: string;
  flight_number: string;
  duration: number;
}

export interface FlightData {
  flights: Flight[];
}
