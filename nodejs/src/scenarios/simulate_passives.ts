import fs from "fs";
import { resolveEffect } from "../engine/resolveEffects.ts";

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function getPlayer(state, id) {
  return state.players.find(p => p.id === id);
}

function hydrate(state) {
  for (const player of state.players) {
    if (!player.battlefield) player.battlefield = {};
    player.kind = "hero";
    player.armor = player.armor ?? 0;
    player.dmgDealt = player.dmgDealt ?? 0;
    player.curRunes = player.curRunes ?? 0;
    player.idInGame = player.idInGame ?? player.id;
    player.passive = player.passive ?? [];
    player.hand = player.hand ?? [];
    player.library = player.library ?? [];
    player.graveyard = player.graveyard ?? [];
  }
}

function logState(state) {
  console.log("📊 STATE:");
  for (const p of state.players) {
    console.log(`  ${p.id}: runes=${p.curRunes} armor=${p.armor}`);
  }
}

function applyAction(state, action) {
  console.log("➡️ ACTION:", action.type);

  switch (action.type) {
    case "start_turn": {
      console.log(`🌅 START TURN ${state.turn}`);
      for (const player of state.players) {
        for (const eff of player.passive) {
          resolveEffect(player, eff, { cardId: 0 }, state, 'start_turn', player);
        }
      }
      state.turn++;
      return state;
    }

    case "end_turn":
      console.log(`Player ${action.player} ends turn`);
      return state;

    default:
      throw new Error("Unknown action: " + action.type);
  }
}

function checkExpected(state, expected) {
  console.log("\n🧪 CHECKING EXPECTATIONS:");
  let pass = true;

  const druid = getPlayer(state, "Druid");
  const warrior = getPlayer(state, "Warrior");

  const okRunes = druid.curRunes === expected.Druid_runes_after_3_turns;
  const okArmor = warrior.armor === expected.Warrior_armor_after_3_turns;

  console.log(`  Druid curRunes: ${druid.curRunes} (expected ${expected.Druid_runes_after_3_turns}) ${okRunes ? "✅" : "❌"}`);
  console.log(`  Warrior armor: ${warrior.armor} (expected ${expected.Warrior_armor_after_3_turns}) ${okArmor ? "✅" : "❌"}`);

  if (!okRunes || !okArmor) pass = false;
  console.log(pass ? "\n✅ ALL TESTS PASSED" : "\n❌ SOME TESTS FAILED");
}

function runScenario(file) {
  const scenario = JSON.parse(fs.readFileSync(file, "utf-8"));
  let state = clone(scenario);
  hydrate(state);

  console.log("=== START SCENARIO:", scenario.description, "===");

  for (const action of scenario.actions) {
    state = applyAction(state, action);
    logState(state);
  }

  console.log("\n=== END SCENARIO ===");

  if (scenario.expected) {
    checkExpected(state, scenario.expected);
  }
}

runScenario(process.argv[2]);