

export async function requireAuth() {

    const username = localStorage.getItem("username");

    if (!username)
    {    
        console.log("Please log in boss");
        return null;
    }

    try {
        console.log("SILLY BILLY USERNAME:", username);
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/${username}`
        );

        if (!res.ok)
        {
            localStorage.removeItem("username");
            localStorage.removeItem("token");
            console.log("Session expired, please log in again boss");

            return null;
        };

        return username;
    }
    catch {
        console.log("Server unavailable");
        return null;
    }
};

