"use client";

import OpponentBoard from "./OpponentBoard";

interface SpectatorBoardProps {
  players: any[];
  turnNumber: number;
}

function battlefieldToSlots(battlefield: any): (any | null)[] {
  return Array.from({ length: 8 }, (_, i) => battlefield[`bf${i + 1}`] ?? null);
}

function PlayerSection({ player, flipped = false }: { player: any; flipped?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <div className={`flex items-center justify-between px-3 py-1.5 rounded-sm bg-black/30 text-xs ${flipped ? "flex-row-reverse" : ""}`}>
        <span className="font-semibold text-blue-200 text-sm">{player.username ?? player.class}</span>
        <div className="flex gap-3 text-blue-200/60">
          <span>🛡 {player.armor}</span>
          <span className="text-red-400">⚔ {player.dmgDealt}</span>
          <span className="text-yellow-400">◈ {player.curRunes}</span>
          <span>📚 {player.library?.length ?? 0}</span>
        </div>
      </div>
      <OpponentBoard
        cards={battlefieldToSlots(player.battlefield)}
        label={player.username ?? player.class}
        onPlay={() => {}}
        potentialTargets={[]}
        selectedTargets={[]}
        onClick={() => {}}
      />
    </div>
  );
}

export default function SpectatorBoard({ players, turnNumber }: SpectatorBoardProps) {
  if (!players || players.length < 2) {
    return <div className="text-center text-white/30 py-10">Waiting for game state…</div>;
  }

  return (
    <div className="pt-16 flex flex-col gap-3 p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-center">
        <span className="text-[10px] uppercase tracking-[0.2em] text-amber-400/60 border border-amber-400/20 px-3 py-0.5 rounded-sm">
          👁 Spectator — Turn {turnNumber}/8
        </span>
      </div>

      <PlayerSection player={players[0]} />

      <div className="border-t border-white/10 my-1" />

      <PlayerSection player={players[1]} flipped />
    </div>
  );
}
