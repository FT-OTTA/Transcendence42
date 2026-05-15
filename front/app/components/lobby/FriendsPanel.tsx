
type FriendStatus = "online" | "offline" | "in room" | "playing" ;

const statusStyles: Record<FriendStatus, string> = {
    online: "text-blue-300 border-blue-300/40 shadow-[0_0_8px_rgba(96,165,250,0.2)]",
    offline: "text-gray-400 border-gray-500/30",
    "in room": "text-green-300 border-green-300/40 shadow-[0_0_8px_rgba(34,197,94,0.2)]",
    playing: "text-red-300 border-red-300/40",
};

type Friend = {
    name : string;
    status : FriendStatus;
    message : string;
};

const friends: Friend[] = [
  { name: "Poman",      status: "online", message: "Je suis dans article"},
  { name: "El Teddy",   status: "offline", message: "KIcked to heaven"},
  { name: "Tonyo",      status: "playing", message: "cpp is fun"},
  { name: "Big Rat 27", status: "in room", message: "nyooooooom"},

];

export default function FriendsPanel() {

    return (
        <div className="h-full min-h-0 p-3 flex flex-col border border-blue-300 bg-black/30 backdrop-blur-sm rounded-sm h-2/3">
            
        
            <h2 className="text-xl mb-2 text-center py-2">Friends</h2>

            {/* Rajouter flex-1 si on veut que create room soit fixe' a la meme place en bas, 
            cool pour quand il y a pleins de rooms, mais moche si il y en a pas bcp */}
            <button className="border border-blue-300 py-2 hover:bg-blue-300 hover:text-black transition">
                + Add a friend
            </button>
            
            <div className="flex flex-col gap-2 flex-1 py-6 overflow-y-auto pr-1">
                {friends.map((friend_list) => (
                    <div
                        key={friend_list.name}
                        className="grid grid-cols-3 gap-2 items-center border border-blue-300/40 p-2"
                    >
                        <div className="font-semibold text-blue-100">
                            {friend_list.name}</div>

                        <div className={`text-xs px-2 py-1 border rounded-sm w-fit ${statusStyles[friend_list.status]}`}>
                            {friend_list.status}
                        </div>

                        <div className="flex gap-2 justify-end">

                                {friend_list.status === "in room" &&(
                                <button className="text-xs border border-blue-300 px-2 py-1 text-green-300 hover:bg-green-300 hover:text-black">
                                    Join
                                </button>
                            )}
                            
                            {friend_list.status === "playing" && (
                                <button className="text-xs border border-blue-400 px-2 py-1 text-blue-300 hover:bg-blue-300 hover:text-black">
                                    Spectate
                                </button>
                            )}

                                <button className="text-xs border border-blue-300 px-2 py-1 hover:bg-blue-300 hover:text-black">
                                    DM
                                </button>
                        
                        </div>

                        <p className="text-xs italic text-blue-200/40 mt-1">
                            {friend_list.message}
                        </p>

                    </div>
            ))}
            </div>

        </div>

    );
}