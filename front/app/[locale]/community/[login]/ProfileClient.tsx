"use client";
import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import Navbar from "../../../components/navigation/Navbar";
import ProfileBanner from "../../../components/community/ProfileBanner";
import ProfileStats from "../../../components/community/ProfileStats";
import MatchHistory from "../../../components/community/MatchHistory";
import ProfileSearchBar from "../../../components/community/ProfileSearchBar";
import LoggedInBadge from "../../../components/login/LoggedInBadge";

export default function ProfileClient({ login }: { login: string }) {

  useEffect(() => {
    if (!login)
      return;

  }, []);

  return (
    <main className="overflow-x-hidden md:overflow-y-hidden min-h-screen bg-[url('/homepage_bg.png')] bg-cover bg-center">
      <Navbar />
      <div className="md:py-5" />
      <LoggedInBadge />

      <div className="max-w-6xl mx-auto px-4 py-4">
        <ProfileSearchBar />
        <ProfileBanner
          username={login}
          mood="J'arrive ratale sur le beat..."
        />
      </div>

      <section className="max-w-6xl mx-auto h-full grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
        <ProfileStats />
        <MatchHistory />
      </section>
    </main>
  );
}