"use client";

import { useEffect, useState, useRef } from "react";
import { requireAuth } from "../login/RequireAuth";
import { customScrollBar } from "../scrollBar";
import { socket } from "@/lib/socket";
import { useTranslations } from "next-intl";
import { cinzel } from "../../fonts";
import clsx from "clsx";

const titleClass = clsx(
    cinzel.className,
    "text-blue-400 text-center text-xl py-2"
)

type Message = {
    id: number;
    name: string;
    message: string;
    isSelf: boolean;
};

interface ChatPanelProps {
    roomId?: number | null;
}

export default function ChatPanel({ roomId = null }: ChatPanelProps) {
    const [chatMessages, setChatMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [error, setError] = useState("");
    const l = useTranslations("Lobby");
    const e = useTranslations("Error");
    
    const scrollRef = useRef<HTMLDivElement | null> (null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const isNearBottom = () => {
        const check = scrollRef.current;
        if (!check) return true;
        return check.scrollHeight - check.scrollTop - check.clientHeight < 100;
    }

    useEffect(() => {
        const scroll = scrollRef.current;
        if (!scroll || !isNearBottom()) return;

        requestAnimationFrame(() => {
            scroll.scrollTop = scroll.scrollHeight;
        });
    }, [chatMessages]);

    function showError(message: string) {
        setError(message);
        setTimeout(() => {
            setError("");
        }, 3000);
    }

    async function fetchMessages() {
        const username = localStorage.getItem("username");
        const url = roomId 
            ? `/api/messages/room/${roomId}`
            : "/api/messages/global";

        const res = await fetch(url);

        if (!res.ok) {
            const err = await res.json();
            alert(err.error);
            return;
        }

        const data = await res.json();

        if (!Array.isArray(data)){
            console.error("Expected array:", data);
            return;
        }

        const formatted: Message[] = data.map((msg: any) => ({
            id: msg.id,
            name: msg.sender.username,
            message: msg.content,
            isSelf: msg.sender.username === username,
        }));
        
        setChatMessages(formatted);
    }

    async function sendMessage() {
        if (!messageInput.trim()) return;

        const username = await requireAuth();
        if (!username) {
            showError("need_login");
            return;
        }

        socket.emit('send_message', {
            username,
            content: messageInput,
            roomId: roomId,
        });

        setMessageInput("");

        if (textareaRef.current)
        {
            textareaRef.current.style.height = "auto";
        }
    }

    useEffect(() => {
        fetchMessages();
        const username = localStorage.getItem("username");

        if (roomId) {
            socket.emit('join_chat', roomId);
        }

        const handleNewMessage = (msg: any) => {
            const formatted: Message = {
                id: msg.id,
                name: msg.sender.username,
                message: msg.content,
                isSelf: msg.sender.username === username,
            };

            setChatMessages((prev) => [...prev, formatted]);
        };

        socket.on('new_message', handleNewMessage);

        return () => {
            socket.off('new_message', handleNewMessage);
            if (roomId) {
                socket.emit('leave_chat', roomId);
            }
        };
    }, [roomId]);

    return (
        <div className="h-full min-h-0 p-3 flex flex-col bg-black/30 backdrop-blur-sm rounded-sm ">
            <h2 className={titleClass}>{l("chat")}</h2>

            <div 
                ref={scrollRef}
                className={`${customScrollBar} flex flex-col flex-1 min-h-0 overflow-y-auto pr-1 px-2`}>
                {chatMessages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.isSelf ? "justify-end" : "justify-start"}`}
                    >
                    <div
                        className={`min-w-0 max-w-[75%] rounded-lg py-1 px-2 border text-xs ${
                            msg.isSelf
                                ? "bg-blue-400/20 border-blue-300/10 text-blue-100"
                                : "bg-black/40 border-blue-300/10 text-blue-200"
                        }`}
                    >
                        <p className="text-xs opacity-60 mb-1">{msg.name}</p>
                        <p className="break-words whitespace-pre-wrap">{msg.message}</p>
                    </div>
                    </div>
                ))}
            </div>

            <div className="shrink-0">
                {error && (
                    <p className="text-sm text-red-400 text-center border border-red-400/40 bg-red-500/10 py-2 px-3 mb-2 rounded-sm">
                        {e(error)}
                    </p>
                )}
                <div className="flex gap-1 items-end">
                    <textarea
                        ref={textareaRef}
                        className="w-full p-2 border border-blue-300/30 rounded-md bg-transparent text-blue-200 outline-none resize-none overflow-hidden"
                        rows={1}
                        value={messageInput}
                        onChange={(e) => {
                            setMessageInput(e.target.value);
                            e.target.style.height = "auto";
                            e.target.style.height = e.target.scrollHeight + "px";
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        placeholder={l("type_message")}
                    />
                    <button
                        onClick={sendMessage}
                        className="px-2 border border-blue-300/30 rounded-xl hover:bg-blue-300 hover:text-black transition self-end pb-2"
                    >
                        {">"}
                    </button>
                </div>
            </div>
        </div>
    );
}