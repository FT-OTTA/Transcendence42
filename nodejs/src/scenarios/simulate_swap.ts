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
    const c = p.board.find(c => c.id === id);
    if (c) return c;
  }
  return null;
}

// 👇 Injecte owner + battlefield à partir de board
function hydrate(state) {
  for (const player of state.players) {
    player.battlefield = {};
    for (const creature of player.board) {
      creature.owner = player;
      player.battlefield[creature.zone] = creature;
    }
  }
}

function logState(state) {
  console.log("📊 BOARD STATE:");
  for (const p of state.players) {
    console.log(p.id, "board:", p.board.map(c => ({
      id: c.id,
      f: c.force,
      e: c.endurance,
      zone: c.zone,
      owner: c.owner?.id
    })));
    console.log(p.id, "battlefield:", Object.entries(p.battlefield).map(([zone, c]: any) => `${zone}: ${c?.id}`));
  }
}

function applyAction(state, action) {
  console.log("➡️ ACTION:", action);

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
      const target2 = getCreature(state, action.target2);

      console.log("🧩 RESOLVE PLAY CARD", {
        caster: caster.id,
        target: target?.id,
        target2: target2?.id
      });

      resolveEffect(
        caster,          // player: Hero
        action.card,     // eff: Effect
        {},              // payload: PlayCardPayload (vide pour le test)
        state,           // game: Game
        undefined,       // fromTiming
        target,          // target
        target2          // target2
      );
      return state;
    }

    default:
      throw new Error("Unknown action " + action.type);
  }
}

function runScenario(file) {
  const scenario = JSON.parse(fs.readFileSync(file, "utf-8"));
  let state = clone(scenario);

  // 👇 Hydrater après le clone
  hydrate(state);

  console.log("=== START SCENARIO ===");
  console.log(scenario.description);

  for (const action of scenario.actions) {
    state = applyAction(state, action);
    logState(state);
  }

  console.log("=== END SCENARIO ===");
}

runScenario(process.argv[2]);