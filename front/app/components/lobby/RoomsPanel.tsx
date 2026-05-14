
const rooms = [
  { id: 1, p1: "Alice", p2: "Bob" },
  { id: 2, p1: "Poman", p2: "Tonio" },
  { id: 3, p1: "Teddy", p2: null },
  { id: 4, p1: "You", p2: null },
  { id: 5, p1: null, p2: null },
];

export default function RoomsPanel() {

    return (
        <div className="h-full border border-blue-300 bg-black/30 backdrop-blur-sm rounded-sm p-4 flex flex-col gap-3">

            <h2 className="text-xl mb-2 text-center">Rooms</h2>

            {/* Rajouter flex-1 si on veut que create room soit fixe' a la meme place en bas, 
            cool pour quand il y a pleins de rooms, mais moche si il y en a pas bcp */}
            
            <div className="flex flex-col gap-2">
                {rooms.map((room) => (
                    <div
                        key={room.id}
                        className="grid grid-cols-4 gap-2 items-center border border-blue-300/40 p-2"
                    >
                        {/* Room ID */}
                        <div>Room #{room.id}</div>

                        {/* Player 1 (should always be there since creator) */}
                        <div>
                            {room.p1}
                        </div>
                        
                        {/* Player 2 (if not there join button) */}
                        <div>
                            {room.p2 ?? (
                                <button className="text-green-300 hover:text-green-100">Join</button>
                            )}
                        </div>

                        {/* Spectate */}
                        <button className="text-blue-300 hover:text-blue-100">
                            Spectate
                        </button>

                    </div>
            ))}
            </div>

            <button className="border border-blue-300 py-2 hover:bg-blue-300 hover:text-black transition">
                + Create room
            </button>

        </div>
    );
}