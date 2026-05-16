"use client";

import ChatPanel from "../components/lobby/ChatPanel";
import FriendsPanel from "../components/lobby/FriendsPanel";
import ProfilePanel from "../components/lobby/ProfilePanel";
import RoomsPanel from "../components/lobby/RoomsPanel";
import Navbar from "../components/navigation/Navbar";
import LoggedInBadge from "../components/login/LoggedInBadge";
import { useState } from "react";

type ActivePanel = "friends" | "chat" | null;

export default function LobbyPage() {

  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

    return (
    <main
      className=" overflow-x-hidden min-h-screen bg-[url('/homepage_bg.png')] bg-cover bg-center h-screen p-4 text-white/80">
        
        <Navbar />
        
        <LoggedInBadge/>

          <div className="hidden md:grid h-screen overflow-hidden grid grid-cols-1 md:grid-cols-4 gap-4 pt-16">

            <div className="flex flex-col gap-4 h-full min-h-0">
                <ProfilePanel />
                <FriendsPanel />
            </div>

            <div className="md:col-span-2 h-full min-h-0">
              <RoomsPanel />
            </div>

            <ChatPanel />          
        
          </div>

          <div className="md:hidden h-screen pt-16 flex flex-col gap-4">
            <ProfilePanel/>

            <div className="flex-1 min-h-0">
              <RoomsPanel />
            </div>

            <div className="flex gap-2">
              <button onClick={() => setActivePanel("friends")}>
                Friends
              </button>

              <button onClick={() => setActivePanel("chat")}>
                Chat
              </button>
            </div>

          </div>

          {activePanel && (
            <div
              className="fixed overflow-y-auto top-0 inset-0 flex bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setActivePanel(null)}
            >
              {activePanel == "friends" && (
                <div onClick={(e) => e.stopPropagation()}>
                  <FriendsPanel />
                </div>
              )}

              {activePanel == "chat" && (
                <div onClick={(e) => e.stopPropagation()}>
                  <ChatPanel />
                </div>
              )}

            </div>
          )}
    </main>
    );
}