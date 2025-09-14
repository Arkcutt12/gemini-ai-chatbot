import { streamText } from "ai";
import { z } from "zod";

import { chatGpt4oModel } from ".";

export async function generateSampleFlightStatus({
  flightNumber,
  date,
}: {
  flightNumber: string;
  date: string;
}) {
  const result = await streamText({
    model: chatGpt4oModel,
    prompt: `Generate flight status for flight number ${flightNumber} on ${date}. Return a JSON object with the following structure:
    {
      "flightNumber": "string",
      "departure": {
        "cityName": "string",
        "airportCode": "string", 
        "airportName": "string",
        "timestamp": "string",
        "terminal": "string",
        "gate": "string"
      },
      "arrival": {
        "cityName": "string",
        "airportCode": "string",
        "airportName": "string", 
        "timestamp": "string",
        "terminal": "string",
        "gate": "string"
      },
      "totalDistanceInMiles": number
    }`,
  });

  const text = await result.text;
  try {
    return JSON.parse(text);
  } catch {
    // Fallback data if parsing fails
    return {
      flightNumber,
      departure: {
        cityName: "Unknown",
        airportCode: "UNK",
        airportName: "Unknown Airport",
        timestamp: new Date().toISOString(),
        terminal: "T1",
        gate: "A1"
      },
      arrival: {
        cityName: "Unknown", 
        airportCode: "UNK",
        airportName: "Unknown Airport",
        timestamp: new Date().toISOString(),
        terminal: "T1",
        gate: "A1"
      },
      totalDistanceInMiles: 500
    };
  }
}

export async function generateSampleFlightSearchResults({
  origin,
  destination,
}: {
  origin: string;
  destination: string;
}) {
  const result = await streamText({
    model: chatGpt4oModel,
    prompt: `Generate search results for flights from ${origin} to ${destination}, limit to 4 results. Return a JSON array with the following structure:
    [
      {
        "id": "string",
        "departure": {
          "cityName": "string",
          "airportCode": "string",
          "timestamp": "string"
        },
        "arrival": {
          "cityName": "string",
          "airportCode": "string",
          "timestamp": "string"
        },
        "airlines": ["string"],
        "priceInUSD": number,
        "numberOfStops": number
      }
    ]`,
  });

  const text = await result.text;
  try {
    const flights = JSON.parse(text);
    return { flights };
  } catch {
    // Fallback data if parsing fails
    return {
      flights: [{
        id: "AA123",
        departure: {
          cityName: origin,
          airportCode: "UNK",
          timestamp: new Date().toISOString()
        },
        arrival: {
          cityName: destination,
          airportCode: "UNK", 
          timestamp: new Date().toISOString()
        },
        airlines: ["Unknown Airlines"],
        priceInUSD: 500,
        numberOfStops: 0
      }]
    };
  }
}

export async function generateSampleSeatSelection({
  flightNumber,
}: {
  flightNumber: string;
}) {
  const result = await streamText({
    model: chatGpt4oModel,
    prompt: `Simulate available seats for flight number ${flightNumber}, 6 seats on each row and 5 rows in total, adjust pricing based on location of seat. Return a JSON array with the following structure:
    [
      {
        "seatNumber": "string",
        "priceInUSD": number,
        "isAvailable": boolean
      }
    ]`,
  });

  const text = await result.text;
  try {
    const seats = JSON.parse(text);
    return { seats };
  } catch {
    // Fallback data if parsing fails
    return {
      seats: [
        { seatNumber: "1A", priceInUSD: 25, isAvailable: true },
        { seatNumber: "1B", priceInUSD: 25, isAvailable: false },
        { seatNumber: "1C", priceInUSD: 25, isAvailable: true },
        { seatNumber: "1D", priceInUSD: 25, isAvailable: true },
        { seatNumber: "1E", priceInUSD: 25, isAvailable: false },
        { seatNumber: "1F", priceInUSD: 25, isAvailable: true }
      ]
    };
  }
}

export async function generateReservationPrice(props: {
  seats: string[];
  flightNumber: string;
  departure: {
    cityName: string;
    airportCode: string;
    timestamp: string;
    gate: string;
    terminal: string;
  };
  arrival: {
    cityName: string;
    airportCode: string;
    timestamp: string;
    gate: string;
    terminal: string;
  };
  passengerName: string;
}) {
  const result = await streamText({
    model: chatGpt4oModel,
    prompt: `Generate price for the following reservation. Return a JSON object with totalPriceInUSD:
    ${JSON.stringify(props, null, 2)}`,
  });

  const text = await result.text;
  try {
    return JSON.parse(text);
  } catch {
    // Fallback data if parsing fails
    return {
      totalPriceInUSD: 1000
    };
  }
}