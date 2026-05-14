import ChatPanel from "../components/lobby/ChatPanel";
import FriendsPanel from "../components/lobby/FriendsPanel";
import ProfilePanel from "../components/lobby/ProfilePanel";
import RoomsPanel from "../components/lobby/RoomsPanel";
import Navbar from "../components/navigation/Navbar";


export default function LobbyPage() {

    return (
    <main
      className=" overflow-x-hidden min-h-screen bg-[url('/homepage_bg.png')] bg-cover bg-center h-screen p-4">
        
        <Navbar />
        
          <div className="h-screen overflow-hidden grid grid-cols-1 md:grid-cols-4 gap-4 pt-16">

          <div className="flex flex-col gap-4 h-full min-h-0">
              <ProfilePanel />
              <FriendsPanel />
          </div>

          <div className="md:col-span-2 h-full min-h-0">
            <RoomsPanel />
          </div>

          <ChatPanel />          
        
        </div>
    </main>
    );
}