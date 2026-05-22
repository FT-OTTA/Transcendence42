export async function requireAuth() {

    const username = localStorage.getItem("username");

    if (!username){
        return null;
    }

    try {
        const res = await fetch(
            `http://localhost:3000/users/${username}`);

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
