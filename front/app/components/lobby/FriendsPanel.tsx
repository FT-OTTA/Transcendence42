
type FriendStatus = "online" | "offline" | "in room" | "playing" ;

type Friend = {
    name : string;
    status : FriendStatus;
};

const friends: Friend[] = [
  { name: "Poman",      status: "online"},
  { name: "El Teddy",   status: "offline"},
  { name: "Tonyo",      status: "playing"},
  { name: "Big Rat 27", status: "in room"},
];

export default function FriendsPanel() {

    return (
        <div className="h-full p-3 flex flex-col border border-blue-300 bg-black/30 backdrop-blur-sm rounded-sm h-2/3">
            
        
            <h2 className="text-xl mb-2 text-center py-2">Friends</h2>

            {/* Rajouter flex-1 si on veut que create room soit fixe' a la meme place en bas, 
            cool pour quand il y a pleins de rooms, mais moche si il y en a pas bcp */}
            
            <div className="flex flex-col gap-2 flex-1">
                {friends.map((friend_list) => (
                    <div
                        key={friend_list.name}
                        className="grid grid-cols-2 gap-2 items-center border border-blue-300/40 p-2"
                    >
                        {/* Room ID */}
                        <div>{friend_list.name}</div>

                        {/* Player 1 (should always be there since creator) */}
                        <div>
                            {friend_list.status}
                        </div>

                    </div>
            ))}
            </div>

            <button className="border border-blue-300 py-2 hover:bg-blue-300 hover:text-black transition">
                + Add a friend
            </button>

        </div>

    );
}