export async function requireAuth() {

    const username = localStorage.getItem("username");

    if (!username){
        return null;
    }

    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/${username}`);

        console.log(res);
        if (!res.ok)
        {
            localStorage.removeItem("token");
            localStorage.removeItem("username");

            alert(
                "Session expired. fk off pls"
            );

            return null;
        }

        return username;
    }
    catch {
        alert("Server unavailable.");
        return null;
    }
}
