"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { requireAuth } from "../login/RequireAuth";
import { customScrollBar } from "../scrollBar";
import { useTranslations } from "next-intl";
import { socket } from "@/lib/socket";
import { useLocale } from 'next-intl';
import clsx from 'clsx';

type Room = {
    id: number;
    p1: string;
    p2: string | null;
}

export default function RoomPanel() {
    const router = useRouter();
    const [roomDetails, setRoomDetails] = useState<Room[]>([]);
    const [error, setError] = useState("");
    const [me, setMe] = useState<string | null>(null);
    const l = useTranslations("Lobby");
    const e = useTranslations("Error");
    const locale = useLocale();

    useEffect(() => {
        requireAuth().then(setMe);

        async function fetchRooms() {
            const res = await fetch("/api/rooms");
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

        fetchRooms();

        const handleRoomUpdated = (room: any) => {
            const formatted = {
                id: room.id,
                p1: room.player1.username,
                p2: room.player2?.username ?? null,
            };
            setRoomDetails((prev) => {
                const exists = prev.find((r) => r.id === room.id);
                if (!exists) return [formatted, ...prev];
                return prev.map((r) => r.id === room.id ? formatted : r);
            });
        };

        const handleRoomError = (err: any) => showError(err.message);

        socket.on("room_updated", handleRoomUpdated);
        socket.on("room_error", handleRoomError);

        return () => {
            socket.off("room_updated", handleRoomUpdated);
            socket.off("room_error", handleRoomError);
        };
    }, []);

    function showError(message: string) {
        setError(message);
        setTimeout(() => setError(""), 3000);
    }

    async function createRoom() {
        const username = await requireAuth();
        if (!username) { showError("need_login"); return; }
        socket.emit("create_room", { username }, (room: any) => {
            router.push(`/${locale}/playground/${room.id}`);
        });
    }

    async function joinRoom(roomId: number) {
        const username = await requireAuth();
        if (!username) { showError("need_login"); return; }
        const room = roomDetails.find(r => r.id === roomId);
        if (room?.p1 === username) { showError("cant_join_own_room"); return; }
        socket.emit("join_room", { roomId, username }, (room: any) => {
            router.push(`/${locale}/playground/${room.id}`);
        });
    }

    const myRoom = roomDetails.find((r: Room) => r.p1 === me || r.p2 === me);
    const isMyRoom = (room: Room) => room.p1 === me || room.p2 === me;
    const isFull = (room: Room) => room.p2 !== null;

    return (
        <div className="h-full min-h-0 border border-blue-300 bg-black/30 backdrop-blur-sm rounded-sm p-4 flex flex-col overflow-hidden">

            <h2 className="text-xl mb-2 text-center">{l("rooms")}</h2>

            {error && (
                <p className="text-sm text-red-400 text-center border border-red-400/40 bg-red-500/10 py-2 px-3 rounded-sm">
                    {e(error)}
                </p>
            )}

            <div className={clsx(customScrollBar, "flex flex-col flex-1 min-h-0 overflow-y-auto mb-4")}>
                {roomDetails.map((room) => (
                    <div
                        key={room.id}
                        className={clsx(
                            "grid grid-cols-4 gap-2 items-center border p-2 transition",
                            isMyRoom(room)
                                ? "border-amber-300/60 bg-amber-500/5"
                                : "border-blue-300/40"
                        )}
                    >
                        <div className={clsx("text-sm", isMyRoom(room) && "text-amber-300")}>
                            #{room.id}
                        </div>

                        <div className="text-sm">{room.p1}</div>

                        <div className="text-sm">
                            {room.p2 ? (
                                <span className="text-blue-200/60">{room.p2}</span>
                            ) : isMyRoom(room) ? (
                                <span className="text-gray-400 text-sm">waiting...</span>
                            ) : (
                                <button
                                    onClick={() => joinRoom(room.id)}
                                    className="text-green-300 hover:text-green-100 transition"
                                >
                                    {l("join")}
                                </button>
                            )}
                        </div>

                        <div className="text-sm">
                            {isMyRoom(room) ? (
                                <button
                                    onClick={() => router.push(`/${locale}/playground/${room.id}`)}
                                    className="text-amber-300 hover:text-amber-100 transition"
                                >
                                    ▶ {l("rejoin")}
                                </button>
                            ) : isFull(room) ? (
                                <button
                                    onClick={() => router.push(`/${locale}/playground/${room.id}?spectate=true`)}
                                    className="text-blue-300 hover:text-blue-100 transition"
                                >
                                    👁 {l("spectate")}
                                </button>
                            ) : null}
                        </div>
                    </div>
                ))}
            </div>

            <button
                className={clsx(
                    "border py-2 transition",
                    myRoom
                        ? "border-amber-300 hover:bg-amber-300 hover:text-black"
                        : "border-blue-300 hover:bg-blue-300 hover:text-black"
                )}
                onClick={myRoom
                    ? () => router.push(`/${locale}/playground/${myRoom.id}`)
                    : createRoom
                }
            >
                {myRoom ? `▶ ${l("rejoin")}` : `+ ${l("create_room")}`}
            </button>
        </div>
    );
}
