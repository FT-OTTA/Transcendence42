"use client";
import LoginCard from "../components/login/LoginCard"
import Navbar from "../components/navigation/Navbar";
import Hero from "../components/landing/Hero";
import Footer from "../components/footer/footer";
import { useEffect, useState } from "react";


export default function Home() {

  const [isLogin, setIsLogin] = useState(false);

  return (
    <main 
      className=" flex flex-col overflow-x-hidden h-screen bg-[url('/homepage_bg.png')] bg-cover bg-center">
      <Navbar />

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
      <Footer/>
    </main>
  );
}