const PeakKey = "X9G7B4QW8L0FJ2RMK5YP3ZSA1HVT6CND"
const PeakKey2 = "9FJ6X7WZQ0LTCPK18BVR2Y5M4GHSDAEN"

const WaitTime = 500
const MaxTry = 5

// Export our request handler
function KeyErrorFunction() {
    return new Response(JSON.stringify({ message: "Key is not true"}), { status: 401 });
}

function WrongApiErrorFunction() {
    return new Response(JSON.stringify({ message: "Wrong api method"}), { status: 402 });
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname.split(/\//);

        if (path[1] === "gamepass") {
            if (request.method === "GET") {
                const headers = new Headers(request.headers);
                
                if (headers.get("key") !== PeakKey) {
                    return KeyErrorFunction();
                }
                
                headers.delete("host");
                headers.delete("roblox-id");
                headers.delete("user-agent");
                headers["user-agent"] = "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36";
                
                const init = {
                    method: request.method,
                    headers,
                };
                
                const ApiUrl = "https://games.roblox.com/v1/games/" + path[2] + "/game-passes" + url.search
                return Gamepasses = fetch(ApiUrl)
            } else {
                return WrongApiErrorFunction(); 
            }
        } else if(path[1] == "CopyGamepass") {
            if (request.method === "POST") {
                const headers = new Headers(request.headers);

                if (headers.get("key") !== PeakKey2) {
                    return KeyErrorFunction();
                }
                
                const rawData = await request.text()

                if (!rawData.trim()) {
                    return new Response(JSON.stringify({ message: "Body is nil"}), { status: 404 });
                }
                
                const Data = JSON.parse(rawData); 

                const UniverseId1 = Data.UniverseId1
                const UniverseId2 = Data.UniverseId2
                
                const Gamepasses = []
                async function GetGamepass() {
                    const ApiUrl = "https://games.roblox.com/v1/games/" + UniverseId1 + "/game-passes?limit=100&sortOrder=1"
                    console.log(ApiUrl)

                    const GamepassResponse = await fetch(ApiUrl);

                    if (!GamepassResponse.ok) {
                        return new Response(JSON.stringify({ message: "Something went wrong"}), { status: 403 });
                    }

                    const GamepassResponseData = await GamepassResponse.json()
                    const NextToken = true
                    
                    Gamepasses.push(...GamepassResponseData["data"])

                    return new Response(JSON.stringify(Gamepasses), { status: 200 });
                }
                
                const GPResponse = await GetGamepass();
                if (!GPResponse.ok) {
                    return GPResponse
                }                

                return GPResponse
            } else {
                return WrongApiErrorFunction();
            }
        } else if(path[1] === "favicon.ico") {
            return fetch("https://www.youtube.com/favicon.ico")
        } else {
            return new Response(JSON.stringify({ message: "Undefined method"}), { status: 400 })
        }
    }
};
