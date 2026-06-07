"use client";

import { useEffect, useState } from "react";
import { requireAuth } from "../login/RequireAuth";
import { customScrollBar } from "../scrollBar";
import { useTranslations } from "next-intl";
import { socket } from "@/lib/socket";
import { cinzel } from "../../fonts";
import clsx from "clsx";

const titleClass = clsx(
    cinzel.className,
    "text-blue-400 text-center text-xl py-2"
)

type FriendStatus = "online" | "offline" | "in room" | "playing";

const statusStyles: Record<FriendStatus, string> = {
    online:
        "text-blue-300 border-blue-300/40 shadow-[0_0_8px_rgba(96,165,250,0.2)]",
    offline: "text-gray-400 border-gray-500/30",
    "in room":
        "text-green-300 border-green-300/40 shadow-[0_0_8px_rgba(34,197,94,0.2)]",
    playing: "text-red-300 border-red-300/40",
};

type Friend = {
    name: string;
    status: FriendStatus;
    message: string;
};

export default function FriendsPanel() {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);

    const [showAddPopup, setShowAddPopup] = useState(false);
    const [friendUsername, setFriendUsername] = useState("");
    const [error, setError] = useState("");
    const [adding, setAdding] = useState(false);
    const [removing, setRemoving] = useState(false);

    const l = useTranslations("Lobby");
    const p = useTranslations("Profile");
    const e = useTranslations("Error");

    async function fetchFriends() {
        try {

            const username = await requireAuth();

            if (!username) 
            {
                setError("You must be logged in to use this feature.");
                return;
            }

            const res = await fetch(
                `/api/friends/${username}`
            );

            const data = await res.json();
            console.log(data);

            const formatted: Friend[] = data.map((f: any) => ({
                name: f.friend.username,
                status: (f.friend.isOnline ?? false) ? "online" : "offline",
                message: ""
            }));

            setFriends(formatted);
        } catch (err) {
            console.error("Failed to fetch friends:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleAddFriend() {
    
        const username = await requireAuth();

        if (!username) 
        {
            setError("need_login");
            return;
        }

        console.log(username);
        if (!friendUsername.trim()) {
            setError("no_username");
            return;
        }

        try {
            setAdding(true);
            setError("");

            const res = await fetch(
                "/api/friends/add",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username,
                        friendUsername,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                setError("fail_add");
                return;
            }

            await fetchFriends();

            setFriendUsername("");
            setShowAddPopup(false);

        } catch {
            setError("server_error");
        } finally {
            setAdding(false);
        }
    }

    async function handleRemoveFriend(targetName: string) {
    
        const username = await requireAuth();

        if (!username) 
        {
            setError("need_login");
            return;
        }

        console.log(username);
        if (!targetName.trim()) {
            setError("no_username");
            return;
        }

        try {
            setAdding(true);
            setError("");

            const res = await fetch(
                "/api/friends/remove",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        username,
                        friendUsername: targetName,
                    }),
                }
            );

            const data = await res.json();

            if (!res.ok) {
                setError("fail_remove");
                return;
            }

            await fetchFriends();

            setFriendUsername("");
            setShowAddPopup(false);

        } catch {
            setError("server_error");
        } finally {
            setAdding(false);
        }
    }

    useEffect(() => {
        fetchFriends().then(() => {
            return requireAuth();
        })
        .then((username) => {
            if (username)
            {
                socket.emit("user_logged_in", { username });
                socket.emit("get_online_users");
            }
        })
        .catch((err) => console.error("ERROR: initializing friends sockets:", err));

        socket.on("online_users_list", (onlineUsernames: string[]) => {
            setFriends((prevFriends) =>
                prevFriends.map((friend) => ({
                    ...friend,
                    status: onlineUsernames.some(name => name.toLowerCase() === friend.name.toLowerCase()) ? "online" : "offline"}))
            );
        });

        const handleStatusChange = (data: { username: string; isOnline: boolean }) => {
            setFriends((prevFriends) =>
                prevFriends.map((friend) =>
                    friend.name === data.username
                        ? { ...friend, status: data.isOnline ? "online" : "offline" }
                        : friend
                )
            );
        };

        socket.on("status_changed", handleStatusChange);
        return () => {
            socket.off("online_users_list");
            socket.off("status_changed", handleStatusChange);
        };
    }, []);

    if (loading) {
        return (
            <div className="h-full p-3 border border-blue-300 bg-black/30 backdrop-blur-sm rounded-sm flex items-center justify-center text-blue-200">
                {l("loading_friends")}
            </div>
        );
    }

return (
    <>
        <div className="h-full min-h-0 p-3 flex flex-col bg-black/30 backdrop-blur-sm rounded-sm">

            <h2 className={titleClass}>
                {l("friends")}
            </h2>

            <button
                onClick={() => setShowAddPopup(true)}
                className="border border-blue-300/30 rounded-md py-2 hover:bg-blue-300 hover:text-black transition"
            >
                + {l("add_friend")}
            </button>

            <div className={`${customScrollBar} flex flex-col gap-2 flex-1 py-4 overflow-y-auto pr-1`}>

                {friends.length === 0 && (
                    <p className="text-center text-blue-200/50 text-sm mt-4">
                        {l("no_friends")}
                    </p>
                )}

                {friends.map((friend) => (
                    <div
                        key={friend.name}
                        className="flex flex-col gap-2 border border-blue-300/40 p-3"
                    >
                        <div className="flex items-center justify-between gap-2 min-w-0">
                            <div className="font-semibold text-blue-100 truncate">
                                {friend.name}
                            </div>
                            <div className={`text-xs px-2 py-1 border rounded-sm shrink-0 ${statusStyles[friend.status]}`}>
                                {p(friend.status)}
                            </div>
                        </div>
                
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleRemoveFriend(friend.name)}
                                className="flex-1 text-center text-xs border border-red-300 px-2 py-1 hover:bg-red-300 hover:text-black"
                            >
                                {l("remove")}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {showAddPopup && (
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={() => setShowAddPopup(false)}
            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-sm border border-blue-300 bg-black/80 backdrop-blur-sm p-6 rounded-sm flex flex-col gap-4"
                >
                    <h3 className="text-xl text-center text-blue-100">
                        {l("add_friend")}
                    </h3>

                    <input
                        type="text"
                        value={friendUsername}
                        onChange={(e) =>
                            setFriendUsername(e.target.value)
                        }
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleAddFriend();
                            }
                        }}
                        placeholder= {l("username")}
                        className="w-full px-3 py-2 bg-transparent border border-blue-300 text-blue-200 outline-none"
                    />


                    {error && (
                        <p className="text-sm text-red-400 text-center border border-red-400/40 bg-red-500/10 py-2 px-3 rounded-sm">
                            {e(error)}
                        </p>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={() =>
                                {
                                    setShowAddPopup(false);
                                    setError("");
                                    setFriendUsername("");
                                }
                            }
                            className="flex-1 border border-gray-500 py-2 hover:bg-gray-700 transition"
                        >
                            {l("cancel")}
                        </button>

                        <button
                            onClick={handleAddFriend}
                            disabled={adding}
                            className="flex-1 border border-blue-300 py-2 hover:bg-blue-300 hover:text-black transition"
                        >
                            {adding
                                ? l("adding")
                                : l("add_friend")}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
);
}