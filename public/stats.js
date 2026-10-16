export const ZONES = [
  {
    name: "Molten Core",
    short: "Molten Core",
    tag: "THE FIRE BELOW",
    color: "#ed9751",
    glyph: "♨",
    boss: "Ragnaros",
    total: 10,
  },
  {
    name: "Onyxia",
    short: "Onyxia’s Lair",
    tag: "MORE DOTS. MORE MEMORIES.",
    color: "#c183b9",
    glyph: "♜",
    boss: "Onyxia",
    total: 1,
  },
  {
    name: "Blackwing Lair",
    short: "Blackwing Lair",
    tag: "THE BLACK DRAGONFLIGHT",
    color: "#da6f68",
    glyph: "♞",
    boss: "Nefarian",
    total: 8,
  },
  {
    name: "Temple of Ahn'Qiraj",
    short: "Temple of Ahn’Qiraj",
    tag: "BEYOND THE GATES",
    color: "#b9c06d",
    glyph: "◉",
    boss: "C'Thun",
    total: 9,
  },
  {
    name: "Naxxramas",
    short: "Naxxramas",
    tag: "THE LONG WINTER",
    color: "#83c5c7",
    glyph: "❄",
    boss: "Kel'Thuzad",
    total: 15,
  },
];
export const COLORS = {
  Warrior: "#c79c6e",
  Paladin: "#f58cba",
  Hunter: "#abd473",
  Rogue: "#fff17a",
  Priest: "#e9e8df",
  Shaman: "#5d9bf8",
  Mage: "#69ccf0",
  Warlock: "#ae9cdd",
  Druid: "#ff9b45",
  Unknown: "#9d9c90",
};
export const number = (n) => new Intl.NumberFormat("en-AU").format(n);
export const date = (n) =>
  new Intl.DateTimeFormat("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Australia/Sydney",
  }).format(new Date(n));
export function duration(ms) {
  const s = Math.round(ms / 1000);
  return s >= 3600
    ? `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
    : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;
}
export function median(a) {
  const b = [...a].sort((a, b) => a - b);
  const m = Math.floor(b.length / 2);
  return b.length ? (b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2) : null;
}
export function unionDuration(sessions) {
  const spans = sessions
    .map((s) => [s.start, s.end])
    .filter(([a, b]) => b > a)
    .sort((a, b) => a[0] - b[0]);
  let total = 0,
    end = -Infinity;
  for (const [a, b] of spans) {
    total += Math.max(0, b - Math.max(a, end));
    end = Math.max(end, b);
  }
  return total;
}
export function summarize(data, sessions) {
  const nights = [...new Set(sessions.map((s) => s.night))].sort();
  const memberStats = new Map(
    data.members.map((m) => [
      m.id,
      {
        ...m,
        sessions: 0,
        nights: new Set(),
        dpsNights: new Set(),
        hpsNights: new Set(),
        kills: 0,
        percentiles: [],
        healing: [],
        bestDps: null,
        bestHps: null,
        first: Infinity,
        last: 0,
      },
    ]),
  );
  const bosses = new Map(),
    monthly = new Map();
  for (const s of sessions) {
    const month = s.night.slice(0, 7);
    if (!monthly.has(month)) monthly.set(month, new Set());
    monthly.get(month).add(s.night);
    for (const id of s.members) {
      const m = memberStats.get(id);
      if (!m) continue;
      m.sessions++;
      m.nights.add(s.night);
      m.first = Math.min(m.first, s.start);
      m.last = Math.max(m.last, s.start);
      m.kills += s.fights.filter((f) => f.kill).length;
    }
    for (const p of s.performances) {
      const m = memberStats.get(p.characterId);
      if (!m) continue;
      if (p.metric === "dps") {
        m.percentiles.push(...p.percentiles);
        if (p.percentiles.length) m.dpsNights.add(s.night);
        if (p.best && (!m.bestDps || p.best.amount > m.bestDps.amount))
          m.bestDps = p.best;
      } else if (p.metric === "hps") {
        m.healing.push(...p.percentiles);
        if (p.percentiles.length) m.hpsNights.add(s.night);
        if (p.best && (!m.bestHps || p.best.amount > m.bestHps.amount))
          m.bestHps = p.best;
      }
    }
    for (const f of s.fights) {
      const b = bosses.get(f.bossId) || {
        id: f.bossId,
        name: f.name,
        zone: s.zone,
        kills: 0,
        wipes: 0,
        first: null,
        fastest: null,
      };
      if (f.kill) {
        b.kills++;
        if (!b.first || f.start < b.first.start)
          b.first = { ...f, sessionId: s.id };
        if (
          f.end > f.start &&
          (!b.fastest || f.end - f.start < b.fastest.end - b.fastest.start)
        )
          b.fastest = { ...f, sessionId: s.id };
      } else b.wipes++;
      bosses.set(f.bossId, b);
    }
  }
  const members = [...memberStats.values()]
    .filter((m) => m.sessions)
    .map((m) => ({
      ...m,
      nightCount: m.nights.size,
      medianDps: median(m.percentiles),
      medianHps: median(m.healing),
    }))
    .sort(
      (a, b) => b.nightCount - a.nightCount || a.name.localeCompare(b.name),
    );
  const allBosses = [...bosses.values()];
  const zones = ZONES.map((z) => {
    const ss = sessions.filter((s) => s.zone === z.name);
    const bs = allBosses.filter((b) => b.zone === z.name);
    return {
      ...z,
      sessions: ss.length,
      kills: bs.reduce((a, b) => a + b.kills, 0),
      wipes: bs.reduce((a, b) => a + b.wipes, 0),
      bosses: bs.filter((b) => b.kills).length,
      first: ss.length ? Math.min(...ss.map((s) => s.start)) : null,
    };
  });
  const dpsLeaders = members
    .filter((m) => m.percentiles.length >= 20 && m.dpsNights.size >= 5)
    .sort(
      (a, b) =>
        b.medianDps - a.medianDps ||
        b.percentiles.length - a.percentiles.length,
    );
  const hpsLeaders = members
    .filter((m) => m.healing.length >= 20 && m.hpsNights.size >= 5)
    .sort(
      (a, b) =>
        b.medianHps - a.medianHps || b.healing.length - a.healing.length,
    );
  return {
    sessions,
    nights,
    members,
    memberStats,
    bosses: allBosses,
    zones,
    monthly: [...monthly].map(([month, nights]) => [month, nights.size]).sort(),
    kills: allBosses.reduce((a, b) => a + b.kills, 0),
    wipes: allBosses.reduce((a, b) => a + b.wipes, 0),
    hours: unionDuration(sessions) / 3600000,
    dpsLeaders,
    hpsLeaders,
    nemesis: [...allBosses].sort(
      (a, b) => b.wipes - a.wipes || a.name.localeCompare(b.name),
    )[0],
    milestones: allBosses
      .filter((b) => b.first)
      .sort((a, b) => a.first.start - b.first.start),
  };
}

export function compareMembers(sessions, a, b) {
  const observed = (id) => sessions.filter((s) => s.members.includes(id));
  const aa = observed(a),
    bb = observed(b);
  const only = (own, other) =>
    own
      .filter((s) => !s.members.includes(other))
      .map((s) => ({
        ...s,
        otherGroupSameRaidNight: sessions.some(
          (t) =>
            t.id !== s.id &&
            t.zoneId === s.zoneId &&
            t.night === s.night &&
            t.members.includes(other),
        ),
      }));
  return {
    a: {
      sessions: aa.length,
      nights: new Set(aa.map((s) => s.night)).size,
      only: only(aa, b),
    },
    b: {
      sessions: bb.length,
      nights: new Set(bb.map((s) => s.night)).size,
      only: only(bb, a),
    },
  };
}
