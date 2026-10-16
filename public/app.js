import { ZONES, COLORS, date, duration, number, summarize } from "./stats.js";
import {
  PHASES,
  RECORDS,
  compact,
  aggregate,
  leaders,
} from "./retrospective.js";
import { zoneArt, bossArt } from "./raid-art.js";
const $ = (q) => document.querySelector(q),
  esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
let data,
  retro,
  values,
  sessions,
  summary,
  showAll = false,
  lastTrigger;
const color = (m) => COLORS[m?.className] || COLORS.Unknown;
const person = (id) => data.members.find((m) => m.id === id);
const name = (id) => person(id)?.name || String(id || "Someone");
const personButton = (id) =>
  person(id)
    ? `<button class="name-button" data-member="${esc(id)}" style="--class:${color(person(id))}">${esc(name(id))}</button>`
    : esc(id);
const avatar = (m) =>
  `<span class="avatar" style="--class:${color(m)}" aria-hidden="true">${esc(m.name.slice(0, 1))}</span>`;
const log = (code, fight, text = "Watch the evidence ↗") =>
  `<a href="https://classic.warcraftlogs.com/reports/${encodeURIComponent(String(code).split(":")[0])}${fight ? "#fight=" + encodeURIComponent(fight) : ""}" target="_blank" rel="noopener noreferrer">${text}</a>`;
const total = (metric, v = values) =>
  [...v.values()].reduce((s, m) => s + (m[metric] || 0), 0);
const ranking = (metric) => leaders(values, data.members, metric);
const bossInfo = (id) =>
  summary.bosses.find((b) => b.id === Number(id)) ||
  data.sessions
    .flatMap((s) =>
      s.fights.map((f) => ({ id: f.bossId, name: f.name, zone: s.zone })),
    )
    .find((b) => b.id === Number(id));
const noData =
  '<p class="empty-note">No entries in this chapter. Try the whole journey.</p>';
const jokeAudio = {
  munted: new Audio("audio/bryn-munted.mp3"),
  dft: new Audio("audio/tinman-dft.mp3"),
};
for (const clip of Object.values(jokeAudio)) {
  clip.preload = "none";
  clip.addEventListener("ended", syncAudioButtons);
  clip.addEventListener("pause", syncAudioButtons);
  clip.addEventListener("play", syncAudioButtons);
}
function syncAudioButtons() {
  for (const button of document.querySelectorAll("[data-audio]")) {
    const playing = !jokeAudio[button.dataset.audio].paused;
    button.setAttribute("aria-pressed", String(playing));
    button.querySelector(".audio-symbol").textContent = playing ? "Ⅱ" : "▶";
  }
}
async function toggleAudio(key) {
  const clip = jokeAudio[key];
  if (!clip) return;
  if (!clip.paused) { clip.pause(); return; }
  for (const other of Object.values(jokeAudio)) if (other !== clip) {
    other.pause(); other.currentTime = 0;
  }
  clip.currentTime = 0;
  try { await clip.play(); } catch {
    openDialog('<h2 class="dialog-title">The guild went quiet.</h2><p>Audio could not play. Try the card again.</p>');
  }
}
function selectedSessions() {
  return data.sessions.filter(
    (s) =>
      s.main &&
      ($("#zone-filter").value === "all" ||
        String(s.zoneId) === $("#zone-filter").value) &&
      ($("#phase-filter").value === "all" ||
        String(s.phase) === $("#phase-filter").value),
  );
}
function render() {
  sessions = selectedSessions();
  values = aggregate(
    retro,
    sessions.map((s) => s.id),
    { combat: $("#combat-filter").value },
  );
  summary = summarize(data, sessions);
  showAll = false;
  const params = new URLSearchParams();
  for (const [k, id] of [
    ["phase", "phase-filter"],
    ["raid", "zone-filter"],
    ["combat", "combat-filter"],
  ])
    if ($("#" + id).value !== "all") params.set(k, $("#" + id).value);
  history.replaceState(
    null,
    "",
    `${location.pathname}${params.size ? "?" + params : ""}${location.hash}`,
  );
  $("#scope-summary").textContent =
    `${sessions.length} raid groups · ${summary.nights.length} evenings${$("#phase-filter").value !== "all" ? " · Phase " + $("#phase-filter").value : ""}`;
  const cells = [
    ["ENEMY DAMAGE", compact(total("damage")), "Some very large numbers."],
    ["HEALING DONE", compact(total("healing")), "Keeping the dream alive."],
    ["DEATHS", number(total("deaths")), "The floor was always there."],
    ["SAPPER CHARGES", number(total("sappers")), "An explosive group effort."],
    [
      "RAID EVENINGS",
      number(summary.nights.length),
      "“Same time on Thursday?”",
    ],
    ["BOSSES DOWN", number(summary.kills), "They had it coming."],
  ];
  $("#stats").innerHTML = cells
    .map(
      ([label, value, note]) =>
        `<div class="stat"><span class="stat-label">${label}</span><strong>${value}</strong><small>${note}</small></div>`,
    )
    .join("");
  renderAwards();
  renderBook();
  renderCampaign();
  renderBosses();
  renderMechanics();
  renderLore();
  renderRoster();
}
function renderAwards() {
  const metrics = [
    "damage",
    "healing",
    "deaths",
    "sappers",
    "interrupts",
    "dispels",
    "mindControlDamage",
    "nonTankMelee",
    "battleRes",
    "manaPotions",
    "worldBuffDeaths",
  ];
  $("#awards").innerHTML = metrics
    .map((k) => {
      const r = RECORDS[k],
        p = ranking(k)[0];
      return `<button class="record-card ${r.tone}" data-record="${k}"><span class="record-top"><span>${r.label}</span><span>↗</span></span><h3>${r.title}</h3><span class="record-name" style="color:${p ? color(p) : "#a9a9a9"}">${p ? esc(p.name) : "Nobody. Yet."}</span><strong class="record-value">${p ? compact(p.value) : "—"}</strong><span class="record-detail">${p ? number(p.value) + " " + r.unit : "No entries in this chapter"}</span></button>`;
    })
    .join("");
}
function renderBook() {
  const metric = $("#metric-filter").value,
    r = RECORDS[metric],
    rows = ranking(metric);
  $("#record-description").textContent = r.description;
  $("#metric-heading").textContent = r.unit.toUpperCase();
  const podium = rows.slice(0, 3);
  const order =
    podium.length === 3 ? [podium[1], podium[0], podium[2]] : podium;
  $("#podium").innerHTML = order.length
    ? order
        .map((m) => {
          const rank = rows.indexOf(m) + 1;
          return `<button class="podium-person ${rank === 1 ? "first" : ""}" data-member="${m.id}"><span class="place">${rank === 1 ? "I" : rank === 2 ? "II" : "III"}</span>${avatar(m)}<b style="color:${color(m)}">${esc(m.name)}</b><strong>${compact(m.value)}</strong><small>${r.unit}</small></button>`;
        })
        .join("")
    : noData;
  $("#leaderboard").innerHTML =
    (showAll ? rows : rows.slice(0, 10))
      .map(
        (m, i) =>
          `<tr><td>${i + 1}</td><td><div class="member-cell">${avatar(m)}<div>${personButton(m.id)}<small>${esc(m.className)}</small></div></div></td><td><span class="table-number" title="${number(m.value)}">${number(m.value)}</span><div class="bar-track"><i style="width:${Math.max(1, (m.value / rows[0].value) * 100)}%"></i></div></td><td><button class="name-button" data-member="${m.id}" aria-label="Open ${esc(m.name)} recap">↗</button></td></tr>`,
      )
      .join("") || `<tr><td colspan="4">${noData}</td></tr>`;
  $("#show-more").hidden = rows.length <= 10;
  $("#show-more").textContent = showAll
    ? "Show the top ten ↑"
    : `Show all ${rows.length} raiders ↓`;
}
function renderCampaign() {
  $("#phases").innerHTML = PHASES.map((p) => {
    const ss = data.sessions.filter((s) => s.phase === p.id);
    const v = aggregate(
      retro,
      ss.map((s) => s.id),
    );
    return `<article class="phase-card" style="--art:url('${zoneArt(p.zone)}')"><small>PHASE ${p.id} · ${p.date}</small><strong>${p.name}</strong><span>${compact(total("damage", v))} damage · ${total("deaths", v)} deaths</span></article>`;
  }).join("");
  $("#zone-cards").innerHTML = ZONES.map((z) => {
    const ss = sessions.filter((s) => s.zone === z.name);
    const zid = data.sessions.find((s) => s.zone === z.name)?.zoneId;
    const bs = summary.bosses.filter((b) => b.zone === z.name);
    const mainBoss = bs.find((b) => b.name === z.boss);
    return `<article class="zone-card" style="--art:url('${zoneArt(zid)}');--accent:${z.color}"><div class="zone-art">${mainBoss && bossArt(mainBoss.id) ? `<img src="${bossArt(mainBoss.id)}" alt="${esc(mainBoss.name)}" loading="lazy">` : ""}</div><div class="zone-copy"><h3>${esc(z.short)}</h3><small>${z.tag}</small><div class="zone-numbers"><span><b>${new Set(ss.map((s) => s.night)).size}</b> nights</span><span><b>${bs.reduce((a, b) => a + b.kills, 0)}</b> kills</span></div></div></article>`;
  }).join("");
}
function renderBosses() {
  const order = $("#boss-sort").value;
  const bs = summary.bosses
    .map((b) => {
      const v = aggregate(
        retro,
        sessions.map((s) => s.id),
        { boss: b.id },
      );
      return { ...b, deaths: total("deaths", v) };
    })
    .sort((a, b) => b[order] - a[order] || a.name.localeCompare(b.name));
  $("#boss-grid").innerHTML =
    bs
      .map(
        (b) =>
          `<button class="boss-card" data-boss="${b.id}">${bossArt(b.id) ? `<img src="${bossArt(b.id)}" alt="" loading="lazy">` : ""}<div><h3>${esc(b.name)}</h3><p>${b.kills} kills · ${b.wipes} wipes & resets</p><p>${b.deaths} raider deaths</p></div></button>`,
      )
      .join("") || noData;
}
const mechanicCases = [
    {
      boss: 668,
      metric: "bombDamage",
      label: "BARON GEDDON",
      title: "You are the bomb.",
      note: "Living Bomb explosions across the raid.",
    },
    {
      boss: 611,
      metric: "adrenalineDamage",
      label: "VAELASTRASZ",
      title: "A little too excited.",
      note: "Burning Adrenaline splash damage.",
    },
    {
      boss: 1111,
      metric: "slimeDamage",
      label: "GROBBULUS",
      title: "Do not drink the green.",
      note: "Injection explosions & poison clouds.",
    },
    {
      boss: 1120,
      metric: "polarityDamage",
      label: "THADDIUS",
      title: "Wrong place. Wrong charge.",
      note: "Polarity damage between players.",
    },
  ];
function mechanicValues(boss) {
  return aggregate(retro, sessions.map((s) => s.id), {
    boss, combat: $("#combat-filter").value,
  });
}
function renderMechanics() {
  $("#mechanics").innerHTML = mechanicCases.map((c) => {
    const v = mechanicValues(c.boss);
    return `<button class="mechanic-card" data-mechanic="${c.boss}"><img src="${bossArt(c.boss)}" alt="${c.label}" loading="lazy"><small>${c.label}</small><h3>${c.title}</h3><strong>${compact(total("friendlyDamage", v))}</strong><p>Damage dealt to teammates.<br>${compact(total(c.metric, v))} mechanic damage received.<br>Open the damage files ↗</p></button>`;
  }).join("");
  $("#mc-highlight").innerHTML =
    `${compact(total("mindControlDamage"))}<small>damage to controlled teammates</small>`;
  const ids = new Set(sessions.map((s) => s.id));
  const incidents = retro.incidents
    .filter(
      (i) =>
        ids.has(i.session) &&
        i.type === "friendly" &&
        ($("#combat-filter").value !== "boss" || i.boss) &&
        ($("#combat-filter").value !== "trash" || !i.boss) &&
        i.player &&
        person(i.player) &&
        person(i.victim),
    )
    .slice(0, 3);
  $("#incidents").innerHTML = incidents
    .map(
      (i) =>
        `<article class="incident">${personButton(i.player)} hit ${personButton(i.victim)} for <b>${number(i.amount)}</b> with ${esc(i.spell)}.${i.lethal ? ' <span class="tag">LETHAL HIT</span>' : ""}<small>${esc(bossInfo(i.boss)?.name || "Between bosses")} · ${date(i.time)}</small>${log(i.code, i.fight)}</article>`,
    )
    .join("");
}
function lore(metric, eyebrow, title, copy) {
  const winner = ranking(metric)[0];
  return `<article class="lore-card"><span class="eyebrow">${eyebrow}</span><h3>${title}</h3><strong>${compact(total(metric))}</strong><p>${copy}</p>${winner ? `<p>${personButton(winner.id)} led the way with ${compact(winner.value)}.</p>` : ""}<button class="text-link" data-record="${metric}">Meet the legends ↗</button></article>`;
}
function renderLore() {
  const trashValues = aggregate(
      retro,
      sessions.map((s) => s.id),
      { combat: "trash" },
    ),
    trashKing = leaders(trashValues, data.members, "deaths")[0];
  $("#lore-cards").innerHTML =
    lore(
      "feignDeaths",
      "NOT DEAD. JUST DRAMATIC.",
      "A hunter’s best acting.",
      "Play dead. Skip the repair bill. Get straight back to shooting.",
    ) +
    lore(
      "worldBuffsLost",
      "THE LONG WALK HOME",
      "All those buffs. Gone.",
      "World buffs lost when a raider died. Somewhere, an Onyxia head was crying.",
    ) +
    lore(
      "lifeTaps",
      "HEALER-POWERED MANA",
      "Your health is my mana.",
      "Life Taps across the guild. A perfectly sustainable business model.",
    ) +
    lore(
      "resurrections",
      "BACK TO WORK",
      "Nobody stays down.",
      "Resurrections that got a guildmate back into the fight—or back onto the next pack.",
    ) +
    lore(
      "sapperDamage",
      "ENGINEERING WAS A PERSONALITY",
      "An explosive contribution.",
      "Enemy damage from Goblin Sapper Charges. Very sensible use of explosives indoors.",
    ) +
    lore(
      "innervates",
      "THE NICEST WHISPER",
      "Mana from a friend.",
      "Innervates cast by guild members. An excellent way to become somebody’s favourite druid.",
    ) +
    `<button class="lore-card audio-card" data-audio="munted" aria-label="Play Most munted: Sengar" aria-pressed="false"><span class="audio-symbol" aria-hidden="true">▶</span><h3>Most munted ...</h3><strong style="color:${COLORS.Shaman}">Sengar</strong><span class="joke-class">Shaman</span></button>` +
    `<button class="lore-card audio-card" data-audio="dft" aria-label="Play Drake Fang Talisman: Tinman" aria-pressed="false"><img class="item-icon" src="art/drake-fang-talisman.jpg" alt="Drake Fang Talisman"><span class="audio-symbol" aria-hidden="true">▶</span><h3>Drake Fang Talisman’s obtained</h3><strong>0</strong><span class="joke-name" style="color:${COLORS.Warrior}">Tinman</span><span class="joke-class">Warrior</span></button>` +
    `<article class="lore-card"><span class="eyebrow">THE REAL FINAL BOSS</span><h3>It was the trash.</h3><strong>${number(total("deaths", trashValues))}</strong><p>Deaths between boss fights.${trashKing ? ` ${esc(trashKing.name)} contributed ${number(trashKing.value)} of them. Thank you for your service.` : ""}</p><button class="text-link" data-trash="true">Open the casualty list ↗</button></article>`;
  syncAudioButtons();
  const ids = new Set(sessions.map((s) => s.id));
  const clutch = retro.clutches
    .filter((c) => ids.has(c.session))
    .sort((a, b) => a.alive - b.alive)
    .slice(0, 3);
  $("#clutch-kills").innerHTML = clutch
    .map(
      (c) =>
        `<article class="clutch-card"><span class="eyebrow">BY A THREAD</span><p>${esc(bossInfo(c.boss)?.name || "A boss")} went down with</p><strong>${c.alive} / ${c.size} still standing.</strong><p>${date(c.time)}. Nobody breathe.</p><div class="survivors">${(c.survivors || []).map(n => `<span>${esc(n)}</span>`).join("")}</div></article>`,
    )
    .join("");
}
function renderRoster() {
  const q = $("#roster-search").value.toLowerCase();
  const ids = new Set(sessions.flatMap((s) => s.members));
  $("#roster").innerHTML =
    data.members
      .filter(
        (m) =>
          ids.has(m.id) && `${m.name} ${m.className}`.toLowerCase().includes(q),
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(
        (m) =>
          `<button class="raider" data-member="${m.id}" style="--class:${color(m)}">${avatar(m)}<span><b>${esc(m.name)}</b><small>${esc(m.className)} · ${compact(values.get(m.id)?.damage || 0)} damage</small></span></button>`,
      )
      .join("") || noData;
}
function openDialog(html) {
  if (!$("#detail-dialog").open) lastTrigger = document.activeElement;
  $("#dialog-content").innerHTML = html;
  $("#detail-dialog").showModal();
  $("#detail-dialog").scrollTop = 0;
}
function closeDialog() {
  $("#detail-dialog").close();
  lastTrigger?.focus?.();
}
function recordDialog(metric, customValues = values) {
  const r = RECORDS[metric],
    rs = leaders(customValues, data.members, metric);
  const table = rs
    .map(
      (m, i) =>
        `<div class="journal-line"><div><span class="tag">${i + 1}</span> ${personButton(m.id)}</div><strong>${number(m.value)} <small>${r.unit}</small></strong></div>`,
    )
    .join("");
  const ids = new Set(sessions.map((s) => s.id));
  const type = {
    bombDamage: "bombDamage",
    adrenalineDamage: "adrenalineDamage",
    slimeDamage: "slimeDamage",
    polarityDamage: "polarityDamage",
    friendlyDamage: "friendly",
  }[metric];
  const incidents = type
    ? retro.incidents
        .filter(
          (i) =>
            ids.has(i.session) &&
            i.type === type &&
            (customValues !== values ? !i.boss :
              ($("#combat-filter").value !== "boss" || i.boss) &&
              ($("#combat-filter").value !== "trash" || !i.boss)),
        )
        .slice(0, 12)
    : [];
  openDialog(
    `<span class="eyebrow">${r.label}</span><h2 class="dialog-title">${r.title}</h2><p class="dialog-subtitle">${r.description}</p><div class="dialog-metrics"><div><strong>${compact(total(metric, customValues))}</strong><small>GUILD TOTAL</small></div><div><strong>${rs.length}</strong><small>RAIDERS IN THE BOOK</small></div></div><div class="dialog-section">${table || noData}</div>${incidents.length ? `<div class="dialog-section"><h3>The moments</h3>${incidents.map((i) => `<div class="journal-line"><div>${i.player ? personButton(i.player) : "The encounter"} → ${person(i.victim) ? personButton(i.victim) : esc(i.victim || "another raider")}<small>${esc(i.spell || r.label)} · ${date(i.time)}</small></div><div>${number(i.amount)}<br>${log(i.code, i.fight, "Log ↗")}</div></div>`).join("")}</div>` : ""}`,
  );
}
function mechanicDialog(id) {
  const c = mechanicCases.find((c) => c.boss === Number(id));
  if (!c) return;
  const v = mechanicValues(c.boss);
  const board = (metric) => leaders(v, data.members, metric).map((m, i) =>
    `<div class="journal-line"><div><span class="tag">${i + 1}</span> ${personButton(m.id)}</div><strong>${number(m.value)}</strong></div>`
  ).join("") || noData;
  const note = c.boss === 1111
    ? "The outgoing table follows clouds linked to a player. The incoming table also includes boss-owned clouds and injection explosions."
    : c.boss === 1120
      ? "Polarity hits show who was involved. Standing on the wrong side is a group sport."
      : c.note;
  openDialog(`<span class="eyebrow">${c.label} · THE DAMAGE FILES</span><h2 class="dialog-title">${c.title}</h2><p class="dialog-subtitle">${note}</p><div class="dialog-metrics"><div><strong>${compact(total("friendlyDamage", v))}</strong><small>DAMAGE TO TEAMMATES</small></div><div><strong>${compact(total(c.metric, v))}</strong><small>MECHANIC DAMAGE RECEIVED</small></div></div><div class="dialog-section"><h3>Sharing the pain</h3>${board("friendlyDamage")}</div><div class="dialog-section"><h3>Caught in the splash zone</h3>${board(c.metric)}</div>`);
}
function memberDialog(id) {
  const m = person(id);
  if (!m) return;
  const v = values.get(id) || {};
  const attended = sessions.filter((s) => s.members.includes(id)),
    nights = new Set(attended.map((s) => s.night));
  const best = [
    "damage",
    "healing",
    "deaths",
    "sappers",
    "interrupts",
    "dispels",
    "battleRes",
    "friendlyDamage",
    "mindControlDamage",
    "worldBuffDeaths",
    "manaPotions",
    "lifeTaps",
  ].filter((k) => v[k] > 0);
  const chartMetric = (v.healing || 0) > (v.damage || 0) ? "healing" : "damage";
  const phases = PHASES.map((p) => {
    const ss = data.sessions.filter((s) => s.phase === p.id);
    return totalForMember(ss, id, chartMetric);
  });
  const max = Math.max(1, ...phases);
  openDialog(
    `<div class="dialog-hero">${avatar(m)}<div><span class="eyebrow">THE RAIDER’S CLASSIC RECAP</span><h2 class="dialog-title" style="color:${color(m)}">${esc(m.name)}</h2><div class="dialog-subtitle">${m.className} · Audacity · Arugal</div></div></div><div class="dialog-metrics">${[
      ["RAID EVENINGS", nights.size],
      ["DAMAGE", compact(v.damage || 0)],
      ["HEALING", compact(v.healing || 0)],
      ["DEATHS", v.deaths || 0],
    ]
      .map(([l, x]) => `<div><strong>${x}</strong><small>${l}</small></div>`)
      .join(
        "",
      )}</div><p class="dialog-subtitle">${nights.size} evenings in the raid. ${number(v.sappers || 0)} sappers brought to the party. ${number(v.dispels || 0)} messes cleaned up.${v.deaths ? ` And ${v.deaths} very personal meetings with the floor.` : ""}</p><div class="dialog-section"><h3>${chartMetric === "healing" ? "Keeping us alive, phase by phase" : "Damage, phase by phase"}</h3><div class="phase-bars" style="--class:${color(m)}">${PHASES.map((p, i) => `<div class="phase-bar"><strong>${compact(phases[i])}</strong><i style="--height:${Math.max(1, (phases[i] / max) * 95)}px"></i><span>PHASE ${p.id}</span></div>`).join("")}</div></div><div class="dialog-section"><h3>The personal record book</h3>${best
      .map((k) => {
        const r = RECORDS[k],
          rank = ranking(k).findIndex((x) => x.id === id) + 1;
        return `<div class="journal-line"><div>${r.label}<small>${rank ? "#" + rank + " in this chapter" : ""}</small></div><strong>${number(v[k])}</strong></div>`;
      })
      .join(
        "",
      )}</div><div class="dialog-section"><h3>Favourite haunt</h3>${ZONES.map(
      (z) => {
        const ss = attended.filter((s) => s.zone === z.name);
        return ss.length
          ? `<div class="journal-line"><div>${esc(z.short)}</div><strong>${ss.length} raid groups</strong></div>`
          : "";
      },
    ).join("")}</div>`,
  );
}
function totalForMember(ss, id, key) {
  return (
    aggregate(
      retro,
      ss.map((s) => s.id),
    ).get(id)?.[key] || 0
  );
}
function bossDialog(id) {
  const b = bossInfo(id);
  if (!b) return;
  const bv = aggregate(
      retro,
      sessions.map((s) => s.id),
      { boss: Number(id) },
    ),
    damage = leaders(bv, data.members, "damage").slice(0, 5),
    deaths = leaders(bv, data.members, "deaths").slice(0, 5);
  const encounters = sessions.flatMap((s) =>
    s.fights
      .filter((f) => f.bossId === Number(id))
      .map((f) => ({ ...f, session: s.id })),
  );
  const kills = encounters.filter((f) => f.kill),
    wipes = encounters.filter((f) => !f.kill),
    fast = [...kills].sort((a, b) => a.end - a.start - (b.end - b.start))[0];
  openDialog(
    `<div class="dialog-hero"><img src="${bossArt(id)}" alt="${esc(b.name)}"><div><span class="eyebrow">${esc(b.zone)}</span><h2 class="dialog-title">${esc(b.name)}</h2></div></div><div class="dialog-metrics"><div><strong>${kills.length}</strong><small>KILLS</small></div><div><strong>${wipes.length}</strong><small>WIPES & RESETS</small></div><div><strong>${compact(total("damage", bv))}</strong><small>GUILD DAMAGE</small></div><div><strong>${total("deaths", bv)}</strong><small>RAIDER DEATHS</small></div></div>${fast ? `<p class="dialog-subtitle">Fastest kill: <strong>${duration(fast.end - fast.start)}</strong> · ${log(fast.reportCode, fast.fightId, "See it happen ↗")}</p>` : ""}<div class="dialog-section"><h3>The heavy hitters</h3>${damage.map((m) => `<div class="journal-line">${personButton(m.id)}<strong>${number(m.value)}</strong></div>`).join("") || noData}</div><div class="dialog-section"><h3>Paid in repair bills</h3>${deaths.map((m) => `<div class="journal-line">${personButton(m.id)}<strong>${m.value} deaths</strong></div>`).join("") || noData}</div><div class="dialog-section"><h3>Pull up a chair</h3>${[
      ...encounters,
    ]
      .sort((a, b) => b.start - a.start)
      .slice(0, 25)
      .map(
        (f) =>
          `<div class="journal-line"><div>${f.kill ? "Victory" : "Wipe / reset"}<small>${date(f.start)} · ${duration(f.end - f.start)}</small></div>${log(f.reportCode, f.fightId, "Original log ↗")}</div>`,
      )
      .join("")}</div>`,
  );
}
async function init() {
  try {
    const responses = await Promise.all([
      fetch("data.json"),
      fetch("events.json"),
    ]);
    if (responses.some((r) => !r.ok))
      throw new Error(
        "The chronicles are taking a moment to arrive. Reload in a little while.",
      );
    [data, retro] = await Promise.all(responses.map((r) => r.json()));
    const bySession = new Map(data.sessions.map((s) => [s.id, s]));
    for (const s of data.sessions) s.fights = [];
    for (const f of retro.attempts) {
      const s = bySession.get(f.session);
      if (s)
        s.fights.push({
          id: `${f.code}:${f.fight}`,
          bossId: f.bossId,
          name: f.name,
          start: f.start,
          end: f.end,
          kill: f.kill,
          reportCode: f.code,
          fightId: f.fight,
        });
    }
    $("#phase-filter").innerHTML += PHASES.map(
      (p) => `<option value="${p.id}">Phase ${p.id} · ${p.name}</option>`,
    ).join("");
    $("#zone-filter").innerHTML += ZONES.map((z) => {
      const s = data.sessions.find((s) => s.zone === z.name);
      return `<option value="${s?.zoneId}">${esc(z.short)}</option>`;
    }).join("");
    $("#metric-filter").innerHTML = Object.entries(RECORDS)
      .map(([k, r]) => `<option value="${k}">${r.label}</option>`)
      .join("");
    $("#metric-filter").value = "damage";
    const params = new URLSearchParams(location.search);
    for (const [k, id] of [
      ["phase", "phase-filter"],
      ["raid", "zone-filter"],
      ["combat", "combat-filter"],
    ]) {
      const v = params.get(k);
      if (v && [...$("#" + id).options].some((o) => o.value === v))
        $("#" + id).value = v;
    }
    $("#archive-story").textContent =
      `${(retro.rawEventRecords / 1e6).toFixed(1)} million event records. One guild’s story.`;
    for (const id of [
      "phase-filter",
      "zone-filter",
      "combat-filter",
    ])
      $("#" + id).addEventListener("change", render);
    $("#metric-filter").addEventListener("change", () => {
      showAll = false;
      renderBook();
    });
    $("#boss-sort").addEventListener("change", renderBosses);
    $("#roster-search").addEventListener("input", renderRoster);
    $("#show-more").addEventListener("click", () => {
      showAll = !showAll;
      renderBook();
    });
    $("#filters").addEventListener("submit", (e) => e.preventDefault());
    $("#reset-filters").addEventListener("click", () => {
      for (const id of ["phase-filter", "zone-filter", "combat-filter"])
        $("#" + id).value = "all";
      render();
    });
    document.addEventListener("click", (e) => {
      const b = e.target.closest(
        "[data-record],[data-member],[data-mechanic],[data-boss],[data-trash],[data-audio]",
      );
      if (!b) return;
      if (b.dataset.record) recordDialog(b.dataset.record);
      else if (b.dataset.member) memberDialog(b.dataset.member);
      else if (b.dataset.mechanic) mechanicDialog(b.dataset.mechanic);
      else if (b.dataset.boss) bossDialog(b.dataset.boss);
      else if (b.dataset.audio) toggleAudio(b.dataset.audio);
      else if (b.dataset.trash) recordDialog("deaths", aggregate(retro, sessions.map(s => s.id), {combat: "trash"}));
    });
    $(".dialog-close").addEventListener("click", closeDialog);
    $("#detail-dialog").addEventListener("click", (e) => {
      if (e.target === $("#detail-dialog")) {
        const r = e.target.getBoundingClientRect();
        if (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        )
          closeDialog();
      }
    });
    $("#load-status").hidden = true;
    $("#dashboard").hidden = false;
    render();
  } catch (e) {
    $("#load-status").textContent = e.message;
  }
}
init();
