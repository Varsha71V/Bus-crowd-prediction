import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Bus {
  id: string;
  route_id: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  eta_next_stop_minutes: number | null;
  next_stop_id: string | null;
  seats_available: number;
  total_capacity: number;
  crowding_level: string;
}

interface BusUpdate {
  latitude: number;
  longitude: number;
  heading: number;
  eta_next_stop_minutes: number | null;
  seats_available: number;
  crowding_level: string;
  last_updated: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Fetch all active buses
    const busesRes = await fetch(`${supabaseUrl}/rest/v1/buses?is_active=eq.true&select=*`, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json'
      }
    });

    const buses: Bus[] = await busesRes.json();

    const updates: Promise<Response>[] = [];

    for (const bus of buses) {
      // Simulate movement
      const headingRad = (bus.heading * Math.PI) / 180;
      const speedKmPerMin = (bus.speed * 60) / 1000;
      const distanceKm = speedKmPerMin * 0.1;

      // Earth's radius in km
      const earthRadius = 6371;
      const latDelta = (distanceKm * Math.cos(headingRad)) / earthRadius * (180 / Math.PI);
      const lngDelta = (distanceKm * Math.sin(headingRad)) / (earthRadius * Math.cos(bus.latitude * Math.PI / 180)) * (180 / Math.PI);

      const newLat = bus.latitude + latDelta;
      const newLng = bus.longitude + lngDelta;
      let newHeading = bus.heading;

      // Simulate route variation - slight random heading changes
      newHeading += (Math.random() - 0.5) * 10;
      if (newHeading < 0) newHeading += 360;
      if (newHeading >= 360) newHeading -= 360;

      // Update ETA - decrease by small amount with some randomness
      let newEta = bus.eta_next_stop_minutes;
      if (newEta != null && newEta > 0) {
        newEta = Math.max(0, newEta - 0.5 + (Math.random() - 0.5) * 0.3);
        if (newEta < 0.5) newEta = 0.5;
      }

      // Simulate crowding changes
      const crowdingFactors = [0, 0, 0, 1, -1, 1, 0, -1, 0, 0];
      const change = crowdingFactors[Math.floor(Math.random() * crowdingFactors.length)];
      const newSeatsAvailable = Math.max(0, Math.min(bus.total_capacity, bus.seats_available + change * 2));

      // Determine crowding level based on seats
      let newCrowdingLevel = bus.crowding_level;
      const seatPercentage = (newSeatsAvailable / bus.total_capacity) * 100;
      if (seatPercentage >= 80) newCrowdingLevel = 'empty';
      else if (seatPercentage >= 50) newCrowdingLevel = 'low';
      else if (seatPercentage >= 25) newCrowdingLevel = 'moderate';
      else if (seatPercentage >= 5) newCrowdingLevel = 'high';
      else newCrowdingLevel = 'full';

      const updateData: BusUpdate = {
        latitude: newLat,
        longitude: newLng,
        heading: newHeading,
        eta_next_stop_minutes: newEta,
        seats_available: newSeatsAvailable,
        crowding_level: newCrowdingLevel,
        last_updated: new Date().toISOString()
      };

      // Update the bus
      const updatePromise = fetch(`${supabaseUrl}/rest/v1/buses?id=eq.${bus.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(updateData)
      });

      updates.push(updatePromise);
    }

    await Promise.all(updates);

    return new Response(
      JSON.stringify({
        success: true,
        updated: buses.length,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error: unknown) {
    console.error('Simulation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
