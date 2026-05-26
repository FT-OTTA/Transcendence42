"use client";

import { useEffect, useState } from "react";

export default function LoggedInBadge() {

    const [username, setUsername] = useState<string | null>(null);

    function logout()
    {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.location.reload();
    }

    async function uservalidation() {

        const storedUsername = localStorage.getItem("username")

        if (!storedUsername)
            return;

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}:3000/users/${storedUsername}`
            );

            if (!res.ok)
            {
                localStorage.removeItem("token");
                localStorage.removeItem("username");
            }   

            setUsername(storedUsername);
        }
        catch (err) {
            console.error(err);
        }   
    }


    useEffect(() => {
        uservalidation();
    }, []);

    if (!username) {
        return (
            <div className="fixed top-13 right-2 z-40 flex flex-col px-4 py-3 rounded-sm text-sm text-blue-200/70">
                    <span className="text-[11px] uppercase tracking-wider opacity-50">
                        Log in to enjoy our incredible features
                    </span>
            </div>
        );
    }
    return (
        <div className="fixed top-13 right-2 z-40 flex flex-col px-4 py-3 rounded-sm text-sm text-blue-200/70">
            <div className="flex items-center gap-2 leading-tight">
                <span className="text-[11px] uppercase tracking-wider opacity-50">
                    Logged in as:
                </span>

                <span className="text-blue-100 font-medium">
                    {username}
                </span>
            </div>

            <button
                onClick={logout}
                className="w-full text-xs px-3 py-1.5 border border-blue-300/20 text-blue-200/60 hover:text-blue-100 hover:border-blue-300/50 transition">
                Logout
            </button>
        </div>
    );
}