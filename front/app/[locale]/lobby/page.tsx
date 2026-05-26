"use client";

import ChatPanel from "../../components/lobby/ChatPanel";
import FriendsPanel from "../../components/lobby/FriendsPanel";
import ProfilePanel from "../../components/lobby/ProfilePanel";
import RoomsPanel from "../../components/lobby/RoomsPanel";
import Navbar from "../../components/navigation/Navbar";
import LoggedInBadge from "../../components/login/LoggedInBadge";
import { useState, useEffect } from "react";

type ActivePanel = "friends" | "chat" | null;


export default function LobbyPage() {

  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

    return (
    <main
      className=" overflow-x-hidden min-h-screen bg-[url('/homepage_bg.png')] bg-cover bg-center h-screen box-border p-4 flex flex-col text-white/80">
        
        {mounted && <Navbar />}
        
        {mounted && <LoggedInBadge/>}

          <div className="hidden md:grid flex flex-col flex-1 overflow-hidden min-h-0 overflow-hidden grid-cols-1 md:grid-cols-4 gap-4 pt-4">

            <div className="flex flex-col gap-4 h-full min-h-0">
                {mounted && <ProfilePanel />}
                {mounted && <FriendsPanel />}
            </div>

            <div className="md:col-span-2 h-full min-h-0">
              {mounted && <RoomsPanel />}
            </div>

            {mounted && <ChatPanel />}          
        
          </div>

          <div className="md:hidden flex-1 pt-16 flex flex-col gap-4">
            {mounted && <ProfilePanel/>}

            <div className="flex-1 min-h-0">
              {mounted && <RoomsPanel />}
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
                  {mounted && <FriendsPanel />}
                </div>
              )}

              {activePanel == "chat" && (
                <div onClick={(e) => e.stopPropagation()}>
                  {mounted && <ChatPanel />}
                </div>
              )}

            </div>
          )}
    </main>
    );
}
