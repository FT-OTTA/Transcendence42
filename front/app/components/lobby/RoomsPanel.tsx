import { useEffect, useState } from "react";
import { requireAuth } from "../login/RequireAuth";
import { customScrollBar } from "../scrollBar";
import { useTranslations } from "next-intl";
import { socket } from "@/lib/socket";


type Room = {

    id: number;
    p1: string;
    p2: string | null;
}


export default function RoomPanel() {

    const [roomDetails, setRoomDetails] = useState<Room[]>([]);
    const [error, setError] = useState("");
    const l = useTranslations("Lobby");
    const e = useTranslations("Error");

    useEffect(() => {
        fetchRooms();
    
        const handleRoomUpdated = (room: any) => {
            const formatted = {
                id: room.id,
                p1: room.player1.username,
                p2: room.player2?.username ?? null,
            };
        
            setRoomDetails((prev) => {
                const exists = prev.find((r) => r.id === room.id);
            
            if (!exists) {
                return [formatted, ...prev];
            }

            return prev.map((r) =>
                r.id === room.id ? formatted : r
            );
        });
    };

    const handleRoomError = (err: any) => {
        showError(err.message);
    };

    socket.on("room_updated", handleRoomUpdated);
    socket.on("room_error", handleRoomError);

    return () => {
        socket.off("room_updated", handleRoomUpdated);
        socket.off("room_error", handleRoomError);
    };
}, []);

    function showError(message: string) {
        setError(message);

        setTimeout(() => {
            setError("");
        }, 3000);
    }

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
        {
            showError("need_login");
            return;
        }

        socket.emit('create_room', {
            username
        });

    }

    async function joinRoom(roomId: number) {   

        const username = await requireAuth();

        if (!username)
        {
            showError("need_login");
            return;
        }

        socket.emit('join_room', {
            roomId,
            username,
        });
    }

    return (
        <div className="h-full min-h-0 border border-blue-300 bg-black/30 backdrop-blur-sm rounded-sm p-4 flex flex-col overflow-hidden">

            <h2 className="text-xl mb-2 text-center ">{l("rooms")}</h2>

            {error && (
                <p className="text-sm text-red-400 text-center border border-red-400/40 bg-red-500/10 py-2 px-3 rounded-sm">
                    {e(error)}
                </p>
            )}
            {/* Rajouter flex-1 si on veut que create room soit fixe' a la meme place en bas, 
            cool pour quand il y a pleins de initialRooms, mais moche si il y en a pas bcp */}

            <div className={`${customScrollBar} flex flex-col flex-1 min-h-0 overflow-y-auto mb-4`}>
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
                            )}
                        </div>

                        {/* Spectate */}
                        <button className="text-blue-300 hover:text-blue-100">
                            {l("spectate")}
                        </button>

                    </div>
            ))}
            </div>

            <button
                className="border border-blue-300 py-2 hover:bg-blue-300 hover:text-black transition"
                onClick={createRoom}
            >
                + {l("create_room")}
            </button>

        </div>
    );
}