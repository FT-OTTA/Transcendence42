"use client";

import { useEffect, useState } from "react";
import { requireAuth } from "../login/RequireAuth";

type Message = {
    id: number;
    name: string;
    message: string;
    isSelf: boolean;
};


export default function ChatPanel() {

    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [error, setError] = useState("");


    function showError(message: string) {
        setError(message);

        setTimeout(() => {
            setError("");
        }, 3000);
    }

    async function fetchMessages() {

        const username = localStorage.getItem("username");

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/messages/global`
        );

        if (!res.ok) {
            const err = await res.json();
            alert(err.error);
            return;
        }

        const data = await res.json();

        console.log(data);

        if (!Array.isArray(data)){
            console.error("Expected array:",data);
            return;
        }

        const formatted: Message[] =
            data.map((msg: any) => ({
                id: msg.id,
                name: msg.sender.username,
                message: msg.content,

                isSelf: msg.sender.username === username,
            }));
        
        setChatMessages(formatted);
    }

    async function sendMessage() 
    {
        if (!messageInput.trim())
            return;

        const username = await requireAuth();

        if (!username)
        {
            showError("You must be logged in to use this feature.");
            return;
        }

        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/messages`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"                    
                },
                body: JSON.stringify({
                    username,
                    content: messageInput,
                    roomId: null,
                }),
            }
        )

        if (!res.ok) {
            const err = await res.json();
            alert(err.error);
            return;
        }

        setMessageInput("");

        fetchMessages();
    }

    useEffect(() => {
        fetchMessages();
    }, []);


    return (
        <div className="h-full min-h-0 p-3 flex flex-col border border-blue-300 bg-black/30 backdrop-blur-sm rounded-sm h-2/3">

            <h2 className="text-xl mb-2 text-center py-2">
                Chat
            </h2>

            <div className="flex flex-col gap-2 flex-1 py-6 overflow-y-auto pr-1 px-2">

                {chatMessages.map((msg, index) => (
                    <div
                        key={msg.id}
                        className={`flex ${
                            msg.isSelf
                                ? "justify-end"
                                : "justify-start"
                        }`}
                    >
                        <div
                            className={`
                                max-w-[75%]
                                rounded-sm
                                p-3
                                border
                                ${
                                    msg.isSelf
                                        ? "bg-blue-400/20 border-blue-300 text-blue-100"
                                        : "bg-black/40 border-blue-300/40 text-blue-200"
                                }
                            `}
                        >
                            <p className="text-xs opacity-60 mb-1">
                                {msg.name}
                            </p>

                            <p>
                                {msg.message}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div>
                {error && (
                    <p className="text-sm text-red-400 text-center border border-red-400/40 bg-red-500/10 py-2 px-3 mb-2 rounded-sm">
                        {error}
                    </p>
                )}
                <div className="flex gap-2">

                    <input
                        className="w-full p-2 border border-blue-300 bg-transparent text-blue-200 outline-none"
                        type="text"
                        value={messageInput}
                        onChange={(e) =>
                            setMessageInput(e.target.value)
                        }
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                sendMessage();
                            }
                        }}
                        placeholder="Type a message..."
                    />

                    <button
                        onClick={sendMessage}
                        className="px-4 border border-blue-300 hover:bg-blue-300 hover:text-black transition"
                    >
                        Send
                    </button>

                </div>
            </div>

        </div>
    );
}