export const PHASES = [
  { id: 1, name: "Into the fire", date: "Aug–Nov 2019", zone: 1000 },
  { id: 2, name: "Old grudges", date: "Nov 2019–Feb 2020", zone: 1001 },
  { id: 3, name: "Blackwing nights", date: "Feb–Apr 2020", zone: 1002 },
  { id: 4, name: "The long grind", date: "Apr–Jul 2020", zone: 1002 },
  { id: 5, name: "Beyond the gates", date: "Jul–Dec 2020", zone: 1005 },
  { id: 6, name: "One last winter", date: "Dec 2020–Apr 2021", zone: 1006 },
];
export const RECORDS = {
  sunderArmors: {
    label: "Sunder Armor casts",
    title: "Five stacks. Keep them coming.",
    unit: "casts",
    description: "Sunder Armor casts by warriors, across all recorded ranks. Each cast counts once, including casts at five stacks.",
    tone: "fire",
  },
  windfuryTotems: {
    label: "Windfury Totem drops",
    title: "A little help from the elements",
    unit: "totem drops",
    description: "Windfury Totems dropped by shamans, across all three ranks. Each placement counts once; buff pulses and extra attacks do not. This measures drops, not uptime.",
    tone: "blue",
  },
  absorbs: {
    label: "Damage absorbed",
    title: "You didn’t feel a thing",
    unit: "damage prevented",
    description:
      "Shields and wards that took the hit before a guildmate had to.",
    tone: "blue",
  },
  feignDeaths: {
    label: "Feign Death escapes",
    title: "Not dead. Just dramatic.",
    unit: "escapes",
    description: "Hunters who played dead and got straight back to work.",
    tone: "green",
  },
  damage: {
    label: "Damage done",
    title: "A very particular set of skills",
    unit: "damage",
    description:
      "Bosses, trash, and everything unfortunate enough to be in the way.",
    tone: "fire",
  },
  healing: {
    label: "Healing done",
    title: "Kept this circus alive",
    unit: "healing",
    description: "For every bad decision, there was a healer trying to fix it.",
    tone: "green",
  },
  deaths: {
    label: "Deaths",
    title: "Spirit Healer VIP",
    unit: "deaths",
    description:
      "Frequent flyer. Familiar face. Probably knew the graveyard shortcuts.",
    tone: "red",
  },
  sappers: {
    label: "Goblin Sapper Charges",
    title: "Licensed demolition expert",
    unit: "charges",
    description: "Why hit one thing when you could explode next to everything?",
    tone: "fire",
  },
  interrupts: {
    label: "Interrupts",
    title: "Absolutely not",
    unit: "interrupts",
    description: "Somebody had to tell the boss to stop talking.",
    tone: "blue",
  },
  dispels: {
    label: "Dispels",
    title: "The clean-up crew",
    unit: "dispels",
    description:
      "Removing curses, poisons, magic—and occasionally the consequences.",
    tone: "violet",
  },
  friendlyDamage: {
    label: "Friendly fire",
    title: "A hazard to colleagues",
    unit: "damage",
    description: "The raid was dangerous enough before we got involved.",
    tone: "red",
  },
  mindControlDamage: {
    label: "Damage to controlled players",
    title: "For your own good",
    unit: "damage",
    description:
      "When your guildmate suddenly became a perfectly reasonable target.",
    tone: "violet",
  },
  nonTankMelee: {
    label: "Boss melee hits on non-tanks",
    title: "That wasn’t your job",
    unit: "boss melee hits",
    description: "Boss auto-attacks caught outside the tank group, with tanks still standing.",
    tone: "fire",
  },
  battleRes: {
    label: "Battle resurrections",
    title: "One more chance",
    unit: "battle resurrections",
    description: "Get up. We are absolutely not walking back yet.",
    tone: "green",
  },
  resurrections: {
    label: "Resurrections",
    title: "Back to work",
    unit: "resurrections",
    description:
      "A guild powered by patience and a very long resurrection cast.",
    tone: "green",
  },
  manaPotions: {
    label: "Mana potions",
    title: "Blue bottle enthusiast",
    unit: "potions",
    description: "The most expensive way to say “I have mana.”",
    tone: "blue",
  },
  healingPotions: {
    label: "Healing potions",
    title: "Emergency refreshments",
    unit: "potions",
    description: "A small drink between you and another repair bill.",
    tone: "red",
  },
  worldBuffDeaths: {
    label: "Deaths with world buffs",
    title: "There go the world buffs",
    unit: "buffed deaths",
    description: "All that travelling. All that waiting. All gone.",
    tone: "gold",
  },
  worldBuffsLost: {
    label: "World buffs lost on death",
    title: "A lifetime of lost buffs",
    unit: "buffs",
    description: "Dragonslayer, Songflower, and a little piece of the soul.",
    tone: "gold",
  },
  lifeTaps: {
    label: "Life Taps",
    title: "Your health is my mana",
    unit: "Life Taps",
    description: "A financial arrangement the healers never agreed to.",
    tone: "violet",
  },
  innervates: {
    label: "Innervates",
    title: "The mana fairy",
    unit: "Innervates",
    description: "The nicest whisper a healer could receive.",
    tone: "green",
  },
  overheal: {
    label: "Overhealing",
    title: "Just making absolutely sure",
    unit: "overhealing",
    description: "You cannot be too alive. Apparently.",
    tone: "green",
  },
  selfDamage: {
    label: "Self-inflicted damage",
    title: "Their own worst enemy",
    unit: "damage",
    description:
      "Sappers, runes, Hellfire. An ambitious relationship with health.",
    tone: "red",
  },
  sapperDamage: {
    label: "Sapper damage",
    title: "Big bang theory",
    unit: "damage",
    description: "An explosive contribution to the guild’s damage bill.",
    tone: "fire",
  },
  friendlyKills: {
    label: "Direct friendly killing blows",
    title: "We need to talk",
    unit: "killing blows",
    description: "The finishing blow came from inside the raid.",
    tone: "red",
  },
  controlledDamage: {
    label: "Damage while controlled",
    title: "Wasn’t me. Technically.",
    unit: "damage",
    description:
      "Enemy mind control made this guildmate a problem for everyone else.",
    tone: "violet",
  },
  damageTaken: {
    label: "Damage taken",
    title: "The punching bag",
    unit: "damage",
    description: "An extraordinary amount of punishment. Some of it voluntary.",
    tone: "gold",
  },
  manaRestored: {
    label: "Mana from potions",
    title: "Liquid assets",
    unit: "mana",
    description: "Turning gold into one more cast, one bottle at a time.",
    tone: "blue",
  },
  bombDamage: {
    label: "Geddon bomb damage taken",
    title: "You were the bomb",
    unit: "damage",
    description: "Living Bomb explosion damage across the raid.",
    tone: "fire",
  },
  adrenalineDamage: {
    label: "Vael explosion damage taken",
    title: "Too much adrenaline",
    unit: "damage",
    description: "The explosive ending to a Burning Adrenaline timer.",
    tone: "red",
  },
  slimeDamage: {
    label: "Grobbulus poison damage taken",
    title: "A lovely shade of green",
    unit: "damage",
    description: "Injection explosions and poison clouds. A terrible spa day.",
    tone: "green",
  },
  polarityDamage: {
    label: "Thaddius polarity damage taken",
    title: "Opposites attract",
    unit: "damage",
    description: "Sometimes a little too enthusiastically.",
    tone: "blue",
  },
};
export function compact(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return new Intl.NumberFormat("en-AU").format(n || 0);
}
export function aggregate(
  retro,
  sessionIds,
  { boss = "all", combat = "all" } = {},
) {
  const ids = new Set(sessionIds);
  const values = new Map();
  if (!retro) return values;
  for (const row of retro.rows) {
    if (!ids.has(row[0])) continue;
    if (boss !== "all" && Number(boss) !== row[1]) continue;
    if ((combat === "boss" && !row[1]) || (combat === "trash" && row[1]))
      continue;
    let m = values.get(row[2]);
    if (!m) {
      m = Object.fromEntries(retro.metrics.map((k) => [k, 0]));
      values.set(row[2], m);
    }
    retro.metrics.forEach((k, i) => (m[k] += row[i + 3] || 0));
  }
  return values;
}
export function leaders(values, members, metric) {
  return members
    .map((m) => ({ ...m, value: values.get(m.id)?.[metric] || 0 }))
    .filter((m) => m.value > 0)
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
}

export function dedupeAttempts(attempts) {
  const out = [];
  for (const a of attempts) {
    const match = out
      .filter(
        (b) =>
          b.session === a.session &&
          b.bossId === a.bossId &&
          b.kill === a.kill &&
          ((b.code === a.code && b.fight === a.fight) ||
            (b.code !== a.code && Math.abs(b.start - a.start) <= 30000)),
      )
      .sort(
        (b, c) => Math.abs(b.start - a.start) - Math.abs(c.start - a.start),
      )[0];
    if (!match) out.push(a);
  }
  return out;
}
