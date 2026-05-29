"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import LoginCard from "./LoginCard";

export default function LoggedInBadge() {
    const l = useTranslations("Homepage");
    const [showLogin, setShowLogin] = useState(false);
    
    const [username, setUsername] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.location.reload();
    }

    async function uservalidation() {
        const storedUsername = localStorage.getItem("username");

        if (!storedUsername) return;

        try {
            const res = await fetch(
                `http://localhost:3000/users/${storedUsername}`
            );

            if (!res.ok) {
                localStorage.removeItem("token");
                localStorage.removeItem("username");
            } else {
                setUsername(storedUsername);
            }
        } catch (err) {
            console.error(err);
        }   
    }

    useEffect(() => {
        setMounted(true);
        const localUser = localStorage.getItem("username");
        if (localUser) {
            setUsername(localUser);
        }
        uservalidation();
    }, []);

    if (!mounted)
        return null;

    if (!username) {
        return (
            <>
                <div className="fixed top-13 right-2 z-40 flex flex-col px-4 py-3 rounded-sm text-sm text-blue-200/70">
                    <span className="text-[11px] uppercase tracking-wider opacity-50">
                        {l("log_status")}
                    </span>

                    <button
                        onClick={() => setShowLogin(true)}
                        className="w-full text-xs px-3 py-1.5 border border-blue-300/20 text-blue-200/60 hover:text-blue-100 hover:border-blue-300/50 transition"
                    >
                        {l("log_in")}
                    </button>
                </div>

                {showLogin && (
                    <div
                      className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
                      onClick={() => setShowLogin(false)}
                    >
                      <div onClick={(e) => e.stopPropagation()}>
                        <LoginCard />
                      </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="fixed top-13 right-2 z-40 flex flex-col px-4 py-3 rounded-sm text-sm text-blue-200/70">
            <div className="flex items-center gap-2 leading-tight">
                <span className="text-[11px] uppercase tracking-wider opacity-50">
                    {l("login_as")}
                </span>

                <span className="text-blue-100 font-medium">
                    {username}
                </span>
            </div>

            <button
                onClick={logout}
                className="w-full text-xs px-3 py-1.5 border border-blue-300/20 text-blue-200/60 hover:text-blue-100 hover:border-blue-300/50 transition">
                {l("log_out")}
            </button>
        </div>
    );
}