"use client";

interface GameStatsProps {
  handCount: number;
  loadedCards: number;
  runes?: number;
  onEndTurn?: () => void;  // ✅

}

export default function GameStats({ handCount, loadedCards, runes = 3, onEndTurn}: GameStatsProps) {
  return (
    <div className="border border-blue-300 bg-black/30 backdrop-blur-sm rounded-sm p-4 flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-blue-300 text-center">Game Stats</h3>

	  <h4 className="text-md font-medium text-blue-300 text-center">Turn: 4/8</h4>
      {/* Opponent Stats */}
      <div className="border-b border-blue-300/30 pb-4">
        <h4 className="text-sm text-blue-300/60 uppercase tracking-wider mb-2">Opponent</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-200/70">Score:</span>
            <span className="text-red-400 font-semibold">0</span>
          </div>
        </div>
      </div>

      {/* Player Stats */}
      <div>
        <h4 className="text-sm text-green-300/60 uppercase tracking-wider mb-2">You</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-200/70">Hand Cards:</span>
            <span className="text-green-300 font-semibold">{handCount}/8</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-200/70">Score:</span>
            <span className="text-red-400 font-semibold">100</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-200/70">Runes:</span>
            <span className="text-blue-400 font-semibold">{runes}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="text-xs text-blue-200/60 text-center">
        Loaded Cards: {loadedCards}
      </div>
      <button onClick={onEndTurn} className="border border-blue-300 py-2 px-3 text-sm hover:bg-blue-300 hover:text-black transition mt-2">
        End Turn
      </button>
    </div>
  );
}
