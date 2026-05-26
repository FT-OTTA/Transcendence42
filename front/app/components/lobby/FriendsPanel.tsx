"use client";

import { useEffect, useState } from "react";
import { requireAuth } from "../login/RequireAuth";

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

    async function fetchFriends() {
        try {

            const username = await requireAuth();

            if (!username) 
            {
                setError("You must be logged in to use this feature.");
                return;
            }

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/friends/${username}`
            );

            const data = await res.json();
            console.log(data);

            const formatted: Friend[] = data.map((f: any) => ({
                name: f.friend.username,
                status: "online",
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
            setError("You must be logged in to use this feature.");
            return;
        }

        console.log(username);
        if (!friendUsername.trim()) {
            setError("Please enter a username");
            return;
        }

        try {
            setAdding(true);
            setError("");

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/friends/add`,
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
                setError(data.error || "Failed to add friend");
                return;
            }

            await fetchFriends();

            setFriendUsername("");
            setShowAddPopup(false);

        } catch {
            setError("Server error");
        } finally {
            setAdding(false);
        }
    }

    useEffect(() => {
        fetchFriends();
    }, []);

    if (loading) {
        return (
            <div className="h-full p-3 border border-blue-300 bg-black/30 backdrop-blur-sm rounded-sm flex items-center justify-center text-blue-200">
                Loading friends...
            </div>
        );
    }

    return (
        <>
            <div className="h-full min-h-0 p-3 flex flex-col border border-blue-300 bg-black/30 backdrop-blur-sm rounded-sm">

                <h2 className="text-xl mb-2 text-center py-2">
                    Friends
                </h2>

                <button
                    onClick={() => setShowAddPopup(true)}
                    className="border border-blue-300 py-2 hover:bg-blue-300 hover:text-black transition"
                >
                    + Add a friend
                </button>

                <div className="flex flex-col gap-2 flex-1 py-4 overflow-y-auto pr-1">

                    {friends.length === 0 && (
                        <p className="text-center text-blue-200/50 text-sm mt-4">
                            No friends yet
                        </p>
                    )}

                    {friends.map((friend) => (
                        <div
                            key={friend.name}
                            className="grid grid-cols-3 gap-2 items-center border border-blue-300/40 p-2"
                        >
                            <div className="font-semibold text-blue-100">
                                {friend.name}
                            </div>

                            <div
                                className={`text-xs px-2 py-1 border rounded-sm w-fit ${statusStyles[friend.status]}`}
                            >
                                {friend.status}
                            </div>

                            <div className="flex gap-2 justify-end">

                                {friend.status === "in room" && (
                                    <button className="text-xs border border-green-300 px-2 py-1 text-green-300 hover:bg-green-300 hover:text-black">
                                        Join
                                    </button>
                                )}

                                {friend.status === "playing" && (
                                    <button className="text-xs border border-blue-400 px-2 py-1 text-blue-300 hover:bg-blue-300 hover:text-black">
                                        Spectate
                                    </button>
                                )}

                                <button className="text-xs border border-blue-300 px-2 py-1 hover:bg-blue-300 hover:text-black">
                                    DM
                                </button>

                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showAddPopup && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={() => setShowAddPopup(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-sm border border-blue-300 bg-black/80 backdrop-blur-sm p-6 rounded-sm flex flex-col gap-4"
                    >
                        <h3 className="text-xl text-center text-blue-100">
                            Add Friend
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
                            placeholder="Username..."
                            className="w-full px-3 py-2 bg-transparent border border-blue-300 text-blue-200 outline-none"
                        />


                        {error && (
                            <p className="text-sm text-red-400 text-center border border-red-400/40 bg-red-500/10 py-2 px-3 rounded-sm">
                                {error}
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
                                Cancel
                            </button>

                            <button
                                onClick={handleAddFriend}
                                disabled={adding}
                                className="flex-1 border border-blue-300 py-2 hover:bg-blue-300 hover:text-black transition"
                            >
                                {adding
                                    ? "Adding..."
                                    : "Add Friend"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}