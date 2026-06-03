"use client"
import AvatarFrame from "../AvatarFrame"
import { requireAuth } from "../login/RequireAuth";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function ProfilePanel() {

    const [username, setUsername] = useState("Placeholder");
    const [matches, setMatches] = useState<any[]>([]);
    const [moodPhrase, setMoodPhrase] = useState("");
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    const l = useTranslations("Lobby");

    useEffect(() => {
        async function init() {
            const user = await requireAuth();
            setUsername(user ?? "Placeholder");
            if (!user) return;
            const res = await fetch(`/users/history/${user}`);
            const data = await res.json();
            setMatches(Array.isArray(data) ? data : []);
            
            const res2 = await fetch(`/api/users/${user}`);
            const data2 = await res2.json();
            setMoodPhrase(data2.moodphrase ?? "no mood yet");
            setAvatarUrl(data2.avatarUrl ?? null);
        }
        init();
    }, []);

    const winsNumber = matches.filter(m => m.result === 'win').length;
    const lossesNumber = matches.filter(m => m.result === 'loss').length;
    const drawsNumber = matches.filter(m => m.result === 'draw').length;

    const favoriteClass = matches.length === 0 ? "None" :
        Object.entries(
            matches.reduce((acc, m) => {
                const cls = m.heroClass ?? "Unknown";
                acc[cls] = (acc[cls] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)
        ).sort((a, b) => (b[1] as number) - (a[1] as number))[0][0];

    return (
        <div className="h-auto shrink-0 border border-blue-300 bg-black/30 backdrop-blur-sm rounded-sm md:h-1/3 flex flex-col p-4">
        
            <h2 className="text-xl mb-2 text-center py-2">{l("profile")}</h2>
        
            <div className="flex gap-4 items-start">
                
                <AvatarFrame avatarUrl={avatarUrl} />

                <div className="flex-1 flex flex-col gap-1">

                    <div className="flex justify-between items-start">

                        <h3 className="text-2xl font-semibold text-blue-100">
                            {username}
                        </h3>
                    </div>
        
                    <p className="text-base text-blue-200/70">
                        Favorite class: {favoriteClass}
                    </p>
                    <p className="text-sm text-blue-200/60">
                        {winsNumber}W - {lossesNumber}L - {drawsNumber}D
                    </p>
                    <p className="text-xs italic text-blue-200/40 mt-1">
                        {moodPhrase}
                    </p>

                </div>

            </div>
        
        </div>
    );
}