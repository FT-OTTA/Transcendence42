"use client"
import AvatarFrame from "../AvatarFrame"
import { requireAuth } from "../login/RequireAuth";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function ProfilePanel() {

    const [username, setUsername] = useState("Placeholder");
    const l = useTranslations("Lobby");

    useEffect(() => {

        async function namer()
        {
            const user = await requireAuth();
            console.log("USER IS: ", user);
            setUsername( user ?? "Placeholder");
        }

        namer();
    }, []);


    return (
        <div className="h-half border border-blue-300 bg-black/30 backdrop-blur-sm rounded-sm h-1/3 flex flex-col p-4">
        
            <h2 className="text-xl mb-2 text-center py-2">{l("profile")}</h2>
        
            <div className="flex gap-4 items-start">
                
                <AvatarFrame/>

                <div className="flex-1 flex flex-col gap-1">

                    <div className="flex justify-between items-start">

                        <h3 className="text-2xl font-semibold text-blue-100">
                            {username}
                        </h3>
                        
                        <button className="border border-blue-300 py-2 hover:bg-blue-300 hover:text-black transition">
                            ⚙
                        </button>

                    </div>
        
                    <p className="text-base text-blue-200/70">
                        Favorite class: Mage
                    </p>
                    <p className="text-sm text-blue-200/60">
                        17W - 42L
                    </p>
                    <p className="text-xs italic text-blue-200/40 mt-1">
                        Deep message cuz cool guy
                    </p>

                </div>

            </div>
        
        </div>
    );
}