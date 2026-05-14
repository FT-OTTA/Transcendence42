
const messages = [
  { name: "Poman",      message: "Hello"},
  { name: "El Teddy",   message: "What do you want?"},
  { name: "Tonyo",      message: "No no dont fight guys"},
  { name: "Big Rat 27", message: "hehehehehe ehehehheeh"},
  { name: "Poman",      message: "Hello"},
  { name: "El Teddy",   message: "What do you want?"},
  { name: "Tonyo",      message: "No no dont fight guys"},
  { name: "Big Rat 27", message: "hehehehehe ehehehheeh"},
  { name: "Poman",      message: "Hello"},
  { name: "El Teddy",   message: "What do you want?"},
  { name: "Tonyo",      message: "No no dont fight guys"},
  { name: "Big Rat 27", message: "hehehehehe ehehehheeh"},
  { name: "Poman",      message: "Hello"},
  { name: "El Teddy",   message: "What do you want?"},
  { name: "Tonyo",      message: "No no dont fight guys"},
  { name: "Big Rat 27", message: "hehehehehe ehehehheeh"},
];

export default function ChatPanel() {

    return (
        <div className="h-full min-h-0 p-3 flex flex-col border border-blue-300 bg-black/30 backdrop-blur-sm rounded-sm h-2/3">
            <h2 className="text-xl mb-2 text-center py-2">Chat</h2>

            <div className="flex flex-col gap-2 flex-1 py-6 overflow-y-auto pr-1 px-2">
                {messages.map((msg) => (
                    <div className="grid grid-cols-2 gap-2 items-center border border-blue-300/40 p-2">
                        <div>
                            {msg.name}: {msg.message}
                        </div>

                    </div>
            ))}
            </div>

            <input className="w-full p-2 border border-blue-300 bg-transparent text-blue-200 outline-none"
                type="text"
            >
            </input>
        </div>
    );
}