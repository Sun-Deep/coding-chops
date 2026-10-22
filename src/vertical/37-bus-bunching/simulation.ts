/** A seeded stop-and-board model. Both buses have the same driving speed. */
export const SETTINGS = {
  seed: 37,
  route: 1200,
  stops: 4,
  speed: 8,
  clearance: 18,
  arrivalsPerSecond: 0.075,
  boardingSeconds: 2.5,
  doorsSeconds: 5,
  initialDelay: 35,
  step: 0.25,
  seconds: 420,
} as const;

export type Visit = {
  bus: number;
  stop: number;
  arrival: number;
  departure: number | null;
  queueAtArrival: number;
  boarded: number;
};
export type BusState = {
  position: number;
  nextStop: number;
  state: "hold" | "board" | "drive";
  until: number;
  boarding: number;
  visit: number;
};
export type Snapshot = {
  time: number;
  buses: BusState[];
  queues: number[][];
};
export type Run = { snapshots: Snapshot[]; visits: Visit[] };

export const stopIndex = (position: number) =>
  ((Math.round(position / (SETTINGS.route / SETTINGS.stops)) % SETTINGS.stops) +
    SETTINGS.stops) %
  SETTINGS.stops;

export const run = (
  seed: number = SETTINGS.seed,
  initialDelay: number = SETTINGS.initialDelay,
  boardingSeconds: number = SETTINGS.boardingSeconds,
  arrivalsPerSecond: number = SETTINGS.arrivalsPerSecond,
): Run => {
  let state = seed >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const spacing = SETTINGS.route / SETTINGS.stops;
  // The preceding services cleared these stops before the opening state.
  // These are initial conditions, not a claim of a steady timetable.
  const cleared = [-75, -37.5, -75, -37.5];
  const arrivals = cleared.map((start) => {
    if (arrivalsPerSecond === 0) return [];
    const times: number[] = [];
    for (let t = start; t < SETTINGS.seconds + 100; ) {
      t += -Math.log(1 - random()) / arrivalsPerSecond;
      times.push(t);
    }
    return times;
  });
  const cursors = cleared.map(() => 0);
  const queues: number[][] = cleared.map(() => []);
  const buses: BusState[] = [
    {
      position: 0,
      nextStop: 0,
      state: "hold",
      until: initialDelay,
      boarding: 0,
      visit: -1,
    },
    {
      position: -SETTINGS.route / 2,
      nextStop: -SETTINGS.route / 2,
      state: "hold",
      until: 0,
      boarding: 0,
      visit: -1,
    },
  ];
  const visits: Visit[] = [];
  const snapshots: Snapshot[] = [];
  const arrive = (id: number, time: number) => {
    const b = buses[id];
    const stop = stopIndex(b.nextStop);
    b.state = "board";
    b.until = time + SETTINGS.doorsSeconds;
    b.boarding = 0;
    b.visit = visits.length;
    visits.push({
      bus: id,
      stop,
      arrival: time,
      departure: null,
      queueAtArrival: queues[stop].length,
      boarded: 0,
    });
  };
  for (let tick = 0; tick <= SETTINGS.seconds / SETTINGS.step; tick++) {
    const time = tick * SETTINGS.step;
    queues.forEach((queue, stop) => {
      while (
        cursors[stop] < arrivals[stop].length &&
        arrivals[stop][cursors[stop]] <= time
      )
        queue.push(arrivals[stop][cursors[stop]++]);
    });
    // Front bus first. Clearance prevents the following bus passing through it.
    for (let id = 0; id < buses.length; id++) {
      const b = buses[id];
      const stop = stopIndex(b.nextStop);
      if (b.state === "hold" && time >= b.until) arrive(id, time);
      if (b.state === "board" && time >= b.until) {
        if (queues[stop].length > 0) {
          queues[stop].shift();
          b.boarding++;
          visits[b.visit].boarded++;
          b.until = time + boardingSeconds;
        } else {
          visits[b.visit].departure = time;
          b.state = "drive";
          b.nextStop += spacing;
        }
      }
      if (b.state === "drive") {
        let ahead = buses[1 - id].position;
        while (ahead <= b.position) ahead += SETTINGS.route;
        b.position = Math.max(
          b.position,
          Math.min(
            b.position + SETTINGS.speed * SETTINGS.step,
            b.nextStop,
            ahead - SETTINGS.clearance,
          ),
        );
        if (b.position >= b.nextStop - 0.001) arrive(id, time);
      }
    }
    snapshots.push({
      time,
      buses: buses.map((bus) => ({ ...bus })),
      queues: queues.map((queue) => [...queue]),
    });
  }
  return { snapshots, visits };
};

export const atTime = (result: Run, time: number): Snapshot => {
  const index = Math.max(
    0,
    Math.min(result.snapshots.length - 1, Math.floor(time / SETTINGS.step)),
  );
  const a = result.snapshots[index];
  const b = result.snapshots[Math.min(index + 1, result.snapshots.length - 1)];
  const u = Math.max(0, Math.min(1, (time - a.time) / SETTINGS.step));
  return {
    ...a,
    buses: a.buses.map((bus, id) => ({
      ...bus,
      position: bus.position + (b.buses[id].position - bus.position) * u,
    })),
  };
};

/** Reaching the clearance behind a boarding bus prevents further progress. */
export const blockedAt = (snapshot: Snapshot, id = 1) => {
  const bus = snapshot.buses[id];
  const front = snapshot.buses[1 - id];
  const gap =
    (((front.position - bus.position) % SETTINGS.route) + SETTINGS.route) %
    SETTINGS.route;
  return (
    bus.state === "drive" &&
    front.state === "board" &&
    gap <= SETTINGS.clearance + 1e-6
  );
};

export const blockages = (result: Run, id = 1) => {
  const intervals: { from: number; to: number; seconds: number }[] = [];
  let from: number | null = null;
  for (const snapshot of result.snapshots) {
    if (blockedAt(snapshot, id) && from === null) from = snapshot.time;
    if (!blockedAt(snapshot, id) && from !== null) {
      intervals.push({
        from,
        to: snapshot.time,
        seconds: snapshot.time - from,
      });
      from = null;
    }
  }
  if (from !== null) {
    const to = result.snapshots[result.snapshots.length - 1].time;
    intervals.push({ from, to, seconds: to - from });
  }
  return intervals;
};
