

export async function requireAuth() {

    const username = localStorage.getItem("username");

    if (!username)
    {    
        console.log("Please log in boss");
        return null;
    }

    try {
        const res = await fetch(
            `http://localhost:3000/users/${username}`
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

