"use client";

import LoggedInBadge from "../components/login/LoggedInBadge";
import LoginCard from "../components/login/LoginCard"
import Navbar from "../components/navigation/Navbar";
import Hero from "../components/landing/Hero";
import { useEffect, useState } from "react";


export default function Home() {

  const [isLogin, setIsLogin] = useState(false);

  return (
    <main 
      className=" overflow-x-hidden min-h-screen bg-[url('/homepage_bg.png')] bg-cover bg-center">
      <Navbar />
      <LoggedInBadge/>

      <Hero setIsLogin={setIsLogin}/>
    
      {isLogin && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
          onClick={() => setIsLogin(false)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <LoginCard />
          </div>
        </div>
      )}
    </main>
  );
}