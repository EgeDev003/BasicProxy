const PeakKey = "X9G7B4QW8L0FJ2RMK5YP3ZSA1HVT6CND"
const WaitTime = 500
const MaxTry = 5

// Export our request handler
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname.split(/\//);

        if (path[1] === "gamepass") {
            if (request.method === "GET") {
                const headers = new Headers(request.headers);
                
                if (headers.get("key") !== PeakKey) {
                    return new Response(JSON.stringify({ message: "Key is not true"}), { status: 400 });
                }
                
                headers.delete("host");
                headers.delete("roblox-id");
                headers.delete("user-agent");
                headers["user-agent"] = "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36";
                
                const init = {
                    method: request.method,
                    headers,
                };
                
                function GetGamepass(cursor) {
                    const ApiUrl = "https://games.roblox.com/v1/games/" + path[2] + "/game-passes" + url.search
                    console.log(ApiUrl)
                    const Gamepasses = fetch(ApiUrl)
                    return Gamepasses
                }
                return GetGamepass()
            } else {
                return new Response(JSON.stringify({ message: "Wrong api method"}), { status: 400 })
            }
        } else {
            return new Response(JSON.stringify({ message: "Undefined method"}), { status: 400 })
        }
    }
};
