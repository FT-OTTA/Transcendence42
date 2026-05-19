import { useEffect, useState } from "react";
import { requireAuth } from "../login/requireAuth";

type Room = {

    id: number;
    p1: string;
    p2: string | null;
}


export default function RoomPanel() {

    const [roomDetails, setRoomDetails] = useState<Room[]>([]);
    const [error, setError] = useState("");


    useEffect(() => {
        fetchRooms();
    }, []);

    async function fetchRooms() {
    
        const res = await fetch(
            "http://localhost:3000/rooms"
        );

        if (!res.ok) {
            const err = await res.json();
            alert(err.error);
            return;
        }
    
        const data = await res.json();
    
        const formatted = data.map((room: any) => ({
            id: room.id,
            p1: room.player1.username,
            p2: room.player2?.username ?? null,
        }));
    
        setRoomDetails(formatted);
    }

    async function createRoom() {

        const username =
            await requireAuth();
        
        if (!username)
            return;

        const res = await fetch(
            "http://localhost:3000/rooms/create",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify({
                    username
                }),
            }
        );

        if (!res.ok) {
            const err = await res.json();
            alert(err.error);
            return;
        }


        fetchRooms();
    }

    async function joinRoom(roomId: number) {   

        const username = await requireAuth();

        if (!username)
        {
            setError("You need to be logged in for this feature.");
        }

        await fetch(
            `http://localhost:3000/rooms/${roomId}/join`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify({
                    username
                }),
            }
        );

        fetchRooms();
    }

    return (
        <div className="h-full border border-blue-300 bg-black/30 backdrop-blur-sm rounded-sm p-4 flex flex-col gap-3">

            <h2 className="text-xl mb-2 text-center ">Rooms</h2>

            {/* Rajouter flex-1 si on veut que create room soit fixe' a la meme place en bas, 
            cool pour quand il y a pleins de initialRooms, mais moche si il y en a pas bcp */}
            
            <div className="flex flex-col gap-2 flex-1 overflow-y-auto pr-1">
                {roomDetails.map((room) => (
                    <div
                        key={room.id}
                        className="grid grid-cols-4 gap-2 items-center border border-blue-300/40 p-2"
                    >
                        {/* Room ID */}
                        <div> #{room.id}</div>

                        {/* Player 1 (should always be there since creator) */}
                        <div>
                            {room.p1}
                        </div>
                        
                        {/* Player 2 (if not there join button) */}
                        <div>
                            {room.p2 ?? (
                                <button
                                    onClick={() => joinRoom(room.id)} 
                                    className="text-green-300 hover:text-green-100">Join</button>
                                {error && (
                                    <p className="text-sm text-red-400 text-center border border-red-400/40 bg-red-500/10 py-2 px-3 rounded-sm">
                                        {error}
                                    </p>
                                )}
                            )}
                        </div>

                        {/* Spectate */}
                        <button className="text-blue-300 hover:text-blue-100">
                            Spectate
                        </button>

                    </div>
            ))}
            </div>

            <button 
                className="border border-blue-300 py-2 hover:bg-blue-300 hover:text-black transition"
                onClick={createRoom}
            >
                + Create room
            </button>

        </div>
    );
}