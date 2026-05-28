import fs from "fs";
import { resolveEffect } from "../engine/resolveEffects.ts";

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function getPlayer(state, id) {
  return state.players.find(p => p.id === id);
}

function getCreature(state, id) {
  for (const p of state.players) {
    const c = p.board?.find(c => c.id === id);
    if (c) return c;
  }
  return null;
}

function hydrate(state) {
  for (const player of state.players) {
    if (!player.battlefield) player.battlefield = {};
    for (const creature of (player.board ?? [])) {
      creature.owner = player;
      player.battlefield[creature.zone] = creature;
    }
    // Hydrate aussi depuis battlefield directement
    for (const zone of Object.keys(player.battlefield)) {
      const c = player.battlefield[zone];
      if (c) {
        c.owner = player;
        c.currForce = c.currForce ?? c.force;
        c.currEndurance = c.currEndurance ?? c.endurance;
        if (!player.board) player.board = [];
        if (!player.board.find(x => x.id === c.id)) player.board.push(c);
      }
    }
    // Hero mock
    player.kind = "hero";
    player.armor = player.armor ?? 0;
    player.dmgDealt = player.dmgDealt ?? 0;
    player.idInGame = player.idInGame ?? player.id;
  }
}

function logState(state) {
  console.log("📊 BOARD STATE:");
  for (const p of state.players) {
    const creatures = Object.entries(p.battlefield ?? {})
      .filter(([_, c]) => c != null)
      .map(([zone, c]: any) => ({
        zone,
        id: c.id,
        name: c.name,
        f: c.currForce ?? c.force,
        e: c.currEndurance ?? c.endurance,
        owner: c.owner?.id
      }));
    console.log(`  ${p.id} board:`, creatures);
    console.log(`  ${p.id} hero: armor=${p.armor} dmgDealt=${p.dmgDealt}`);
  }
}

function applyAction(state, action) {
  console.log("➡️ ACTION:", action.type);

  switch (action.type) {
    case "end_turn":
      console.log(`Player ${action.player} ends turn`);
      return state;

    case "start_turn_2":
      state.turn = 2;
      console.log("🌙 TURN 2 START");
      return state;

    case "play_card": {
    const caster = getPlayer(state, action.player);
    const target = getCreature(state, action.target);

    console.log("🧩 RESOLVE PLAY CARD", {
        caster: caster.id,
        target: target?.id ?? target?.name
    });

    const context = {
        targets: [target].filter(Boolean)
    };

    for (let i = 0; i < action.card.effects.length; i++) {
        const effect = action.card.effects[i];
        resolveEffect(
        caster,
        effect,
        {},
        state,
        undefined,
        target,
        undefined,
        context
        );
    }

    return state;
    };

    default:
      throw new Error("Unknown action: " + action.type);
  }
}

function checkExpected(state, expected, scenario) {
  console.log("\n🧪 CHECKING EXPECTATIONS:");
  let pass = true;

  // P2 créature force après -1
  const p2 = getPlayer(state, "P2");
  const creature = Object.values(p2.battlefield ?? {}).find((c: any) => c) as any;
  if (creature) {
    const expectedForce = expected.P2_creature_A_force;
    const expectedEnd = expected.P2_creature_A_endurance;
    const okF = creature.currForce === expectedForce;
    const okE = creature.currEndurance === expectedEnd;
    console.log(`  P2 creature force: ${creature.currForce} (expected ${expectedForce}) ${okF ? "✅" : "❌"}`);
    console.log(`  P2 creature endurance: ${creature.currEndurance} (expected ${expectedEnd}) ${okE ? "✅" : "❌"}`);
    if (!okF || !okE) pass = false;
  }

  // P1 héros dégâts reçus (= dmgDealt de P2, ou armor réduite de P1)
  const p1 = getPlayer(state, "P1");
  const dmgTaken = (p1.initialArmor ?? 0) - p1.armor; // si tu tracks l'armor initiale
  const p1dmg = p1.dmgDealt ?? 0;
  const expectedDmg = expected.P1_hero_damage_taken;
  const okDmg = p1dmg === expectedDmg;
  console.log(`  P1 dmgDealt: ${p1dmg} (expected ${expectedDmg}) ${okDmg ? "✅" : "❌"}`);
  if (!okDmg) pass = false;

  console.log(pass ? "\n✅ ALL TESTS PASSED" : "\n❌ SOME TESTS FAILED");
}

function runScenario(file) {
  const scenario = JSON.parse(fs.readFileSync(file, "utf-8"));
  let state = clone(scenario);
  hydrate(state);

  // Stocker armor initiale pour diff
  for (const p of state.players) {
    p.initialArmor = p.armor;
  }

  console.log("=== START SCENARIO:", scenario.description, "===");

  for (const action of scenario.actions) {
    state = applyAction(state, action);
    logState(state);
  }

  console.log("\n=== END SCENARIO ===");

  if (scenario.expected) {
    checkExpected(state, scenario.expected, scenario);
  }
}

runScenario(process.argv[2]);