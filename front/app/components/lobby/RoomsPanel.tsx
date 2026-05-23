import { useEffect, useState } from "react";
import { requireAuth } from "../login/RequireAuth";
import { customScrollBar } from "../scrollBar";
import { socket } from "@/lib/socket";


type Room = {

    id: number;
    p1: string;
    p2: string | null;
}


export default function RoomPanel() {

    const [roomDetails, setRoomDetails] = useState<Room[]>([]);
    const [error, setError] = useState("");

    const [currentGame, setCurrentGame] = useState<{ roomId: number, heroId: string } | null>(null)
    
    useEffect(() => {
// Permet de restaurer la sélection du héros si la page est rechargée accidentellement (F5, crash, etc.) pendant une partie
        const saved = localStorage.getItem('currentGame')
        if (saved) setCurrentGame(JSON.parse(saved))
// 
        fetchRooms();

        socket.on('room_updated', (room) => {
            const formatted = {
                id: room.id,
                p1: room.player1.username,
                p2: room.player2?.username ?? null,
            };

            setRoomDetails((prev) => {
                const exists = prev.find(r => r.id === room.id);

                if (!exists)
                {
                    return [formatted, ...prev];
                }

                return prev.map(r => 
                    r.id === room.id ? formatted : r
                );
            });
        })
        
        socket.on('room_error', (err) => {
            showError(err.message);
        });

        return () => {
            socket.off('room_updated');
            socket.off('room_error');
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
            showError("You need to be logged in for this feature.");
            return;
        }

        socket.emit('create_room', {
            username
        });

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
        } else {
            const data = await res.json();
            console.log("Room created with ID:", data.id);
            let href = `/playground/${data.id}`;
            window.location.href = href;
        }


        fetchRooms();
    }

    async function joinRoom(roomId: number) {

        const username = await requireAuth();

        if (!username)
        {
            showError("You need to be logged in for this feature.");
            return;
        }

        const res = await fetch(
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
        if (!res.ok) {
                const err = await res.json();
                alert(err.error);
                return;
        }
        else 
        {
            const data = await res.json();
            console.log("Room created with ID:", data.id);
            let href = `/playground/${data.id}`;
            window.location.href = href;
            fetchRooms();
        }
        socket.emit('join_room', {
            roomId,
            username,
        });
    }

    return (
        <div className="h-full min-h-0 border border-blue-300 bg-black/30 backdrop-blur-sm rounded-sm p-4 flex flex-col overflow-hidden">

            <h2 className="text-xl mb-2 text-center ">Rooms</h2>

            {error && (
                <p className="text-sm text-red-400 text-center border border-red-400/40 bg-red-500/10 py-2 px-3 rounded-sm">
                    {error}
                </p>
            )}
            {/* Rajouter flex-1 si on veut que create room soit fixe' a la meme place en bas,
            cool pour quand il y a pleins de initialRooms, mais moche si il y en a pas bcp */}

            <div className={`${customScrollBar} flex flex-col min-h-0 overflow-y-auto`}>
                {roomDetails.map((room) => (
                    <div
                        key={room.id}
                        className="grid grid-cols-4 gap-2 items-center border border-blue-300/40 p-2"
                    >
                        <div>#{room.id}</div>
                        <div>{room.p1}</div>
                        <div>
                            {room.p2 ?? (
                                <button onClick={() => joinRoom(room.id)} className="text-green-300 hover:text-green-100">
                                    Join
                                </button>
                            )}
                        </div>
                        <div>
                            {currentGame?.roomId === room.id ? (
                                <button
                                    onClick={() => window.location.href = `/playground/${room.id}`}
                                    className="text-amber-300 hover:text-amber-100">
                                    ▶ Rejoin
                                </button>
                            ) : room.p2 ? (
                                <button
                                    onClick={() => window.location.href = `/playground/${room.id}?spectate=true`}
                                    className="text-blue-300 hover:text-blue-100">
                                    👁 Spectate
                                </button>
                            ) : null}
                        </div>
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