"use client";

import OpponentBoard from "./OpponentBoard";

interface SpectatorBoardProps {
  players: any[];
  turnNumber: number;
}

function battlefieldToSlots(battlefield: any): (any | null)[] {
  return Array.from({ length: 8 }, (_, i) => battlefield[`bf${i + 1}`] ?? null);
}

export default function SpectatorBoard({ players, turnNumber }: SpectatorBoardProps) {
  if (!players || players.length < 2) {
    return <div className="text-center text-white/30 py-10">Waiting for game state…</div>;
  }

  const p0 = players[0];
  const p1 = players[1];

  return (
    <div className="pt-16 flex flex-col gap-4 min-h-screen p-4">

      <div className="flex items-center justify-center">
        <span className="text-[10px] uppercase tracking-[0.2em] text-amber-400/60 border border-amber-400/20 px-3 py-0.5 rounded-sm">
          👁 Spectator mode — Turn {turnNumber}/8
        </span>
      </div>

      {/* Stats des deux joueurs */}
      <div className="grid grid-cols-2 gap-4 text-sm border border-blue-300/20 bg-black/30 p-4 rounded-sm">
        {[p0, p1].map((p, i) => (
          <div key={i} className="flex flex-col gap-1">
            <span className="text-blue-300/60 uppercase tracking-wider text-xs">{p.username} - {p.class}</span>
            <span className="text-blue-200/70">Armor: <span className="text-blue-400 font-semibold">{p.armor}</span></span>
            <span className="text-blue-200/70">Score: <span className="text-red-400 font-semibold">{p.dmgDealt}</span></span>
            <span className="text-blue-200/70">Runes: <span className="text-yellow-400 font-semibold">{p.curRunes}</span></span>
            <span className="text-blue-200/70">Deck: <span className="text-blue-400 font-semibold">{p.library?.length ?? 0}</span></span>
          </div>
        ))}
      </div>

      {/* Battlefield P0 */}
      <div>
        <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Battlefield</p>
        <OpponentBoard
          cards={battlefieldToSlots(p0.battlefield)}
          label={p0.username ?? p0.class}
          onPlay={() => {}}
          potentialTargets={[]}
          selectedTargets={[]}
          onClick={() => {}}
        />
      </div>

      <div className="border-t border-white/10" />

      {/* Battlefield P1 */}
      <div>
        <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Battlefield</p>
        <OpponentBoard
          cards={battlefieldToSlots(p1.battlefield)}
          label={p1.username ?? p1.class}
          onPlay={() => {}}
          potentialTargets={[]}
          selectedTargets={[]}
          onClick={() => {}}
        />
      </div>

    </div>
  );
}