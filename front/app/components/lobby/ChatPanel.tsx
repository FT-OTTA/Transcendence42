
import { useState } from "react";

type Message = {
    name: string;
    message: string;
    isSelf: boolean;
}

const initialMessages: Message[] = [
  { name: "Poman",      message: "Hello", isSelf: false},
  { name: "El Teddy",   message: "What do you want?", isSelf: false},
  { name: "You",      message: "No no dont fight guys", isSelf: true},
  { name: "Big Rat 27", message: "hehehehehe ehehehheeh", isSelf: false},
];

export default function ChatPanel() {

    const [chatMessages, setChatMessages] = useState(initialMessages);
    const [messageInput, setMessageInput] = useState("");

    function sendMessage() 
    {
        if (!messageInput.trim())
            return;

        const newMessage = {
            name: "You",
            message: messageInput,
            isSelf: true,
        };

        setChatMessages((prev) => [...prev, newMessage]);

        setMessageInput("");
    }


    return (
        <div className="h-full min-h-0 p-3 flex flex-col border border-blue-300 bg-black/30 backdrop-blur-sm rounded-sm h-2/3">
            <h2 className="text-xl mb-2 text-center py-2">Chat</h2>

            <div className="flex flex-col gap-2 flex-1 py-6 overflow-y-auto pr-1 px-2">
                {chatMessages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex ${msg.isSelf ? "justify-end" : "justify-start"}`}
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

            <div className="flex gap-2">
                <input className="w-full p-2 border border-blue-300 bg-transparent text-blue-200 outline-none"
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            sendMessage();
                        }
                    }}
                    placeholder="Type a message..."
                >
                </input>

                <button
                    onClick={sendMessage}
                    className="px-4 border border-blue-300 hover:bg-blue-300 hover:text-black transition"
                >
                    Send
                </button>
            </div>

        </div>
    );
}