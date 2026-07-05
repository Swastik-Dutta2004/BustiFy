import { prisma } from "../lib/prisma";
import { routes1 } from "../data/raw_busrepo_routes1";
import { canon } from "../lib/stopCleaner";
import "dotenv/config";

function parseRoute(route: string) {
  const parts = route.split(" : ");

  if (parts.length < 2) return null;

  const firstPart = parts[0];

  // Extract [via: ...]
  const viaMatch = firstPart.match(/\[[\s]*via[\s]*:([^\]]*)\]/i);
  if (!viaMatch) return null;

  const stopsPart = viaMatch[1].trim();

  // Remove [via: ...]
  const beforeVia = firstPart.slice(0, viaMatch.index).trim();

  // Split only on the FIRST colon
  const colonIndex = beforeVia.indexOf(":");
  if (colonIndex === -1) return null;

  const busName = beforeVia.slice(0, colonIndex).trim();
  const routePart = beforeVia.slice(colonIndex + 1).trim();

  // Split route into FROM and TO
  const routeParts = routePart.split(/\s+to\s+/i);

  if (routeParts.length !== 2) {
    console.error("Invalid route:", route);
    return null;
  }

  const origin = routeParts[0].trim();
  const destination = routeParts[1].trim();

  const stops = [
    ...new Set(
      stopsPart
        .split(",")
        .map(canon)
        .filter(Boolean)
    ),
  ];

  return {
    busName: busName,          // Don't canon() bus names
    fromCity: canon(origin),
    toCity: canon(destination),
    stops,
  };
}

async function main() {
  const buses = [];
  for (const route of routes1) {
    try {
      const parsed = parseRoute(route);
      if (!parsed) {
        console.error("Failed to parse:", route.slice(0, 80));
        continue;
      }

      buses.push({
        busName: parsed.busName,
        fromCity: parsed.fromCity,
        toCity: parsed.toCity,
        stops: parsed.stops,
        departureTime: "",
        arrivalTime: "",
        price: 0,
        totalSeats: 40,
      });

      if (buses.length % 100 === 0) {
        console.log(`Parsed ${buses.length} routes...`);
      }
    } catch (err) {
      console.error("Failed:", route.slice(0, 80));
      if (err instanceof Error) console.error(err.message);
    }
  }

  console.log(`Importing ${buses.length} buses into database...`);
  for (let i = 0; i < buses.length; i += 50) {
    await prisma.bus.createMany({
      data: buses.slice(i, i + 50),
    });
  }

  console.log(`Imported ${buses.length} buses`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  });