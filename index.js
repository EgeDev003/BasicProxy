const PeakKey = "X9G7B4QW8L0FJ2RMK5YP3ZSA1HVT6CND"
const PeakKey2 = "9FJ6X7WZQ0LTCPK18BVR2Y5M4GHSDAEN"

const WaitTime = 500
const MaxTry = 5

const HeaderKeyName = "SecurityKey"

const Scheme = "https://"
const Subdomain = "apis"
const Domain = "roblox.com"

const CreateGamepassApiUrl = Scheme + Subdomain + "." + Domain + "/game-passes/v1/game-passes"
const GetGamepassesApiUrl = Scheme + Subdomain + "." + Domain + "/game-passes/v1/game-passes/universes/{UNIVERSEID}/creator?count=100&cursor="
const GetImageUrlApiUrl = Scheme + "thumbnails" +  "." + Domain +  "/v1/game-passes?gamePassIds={PRODUCTID}&size=150x150&format=Png&isCircular=false"

// Export our request handler
function KeyErrorFunction() {
    return new Response(JSON.stringify({ message: "Key is not true"}), { status: 401 });
}

function WrongApiErrorFunction() {
    return new Response(JSON.stringify({ message: "Wrong api method"}), { status: 402 });
}

function Delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function GetGamepasses(GameId) {
    const GetGamepassesApiUrlChanged = GetGamepassesApiUrl.replace("{UNIVERSEID}", GameId)

    const Gamepasses = []

    async function getGamepasses(Cursor) {
        const GamepassesResponse = await fetch(GetGamepassesApiUrlChanged + (Cursor || ""), {method: "GET"});

        const GamepassesBody = await GamepassesResponse.json();

        if (!GamepassesResponse.ok) {
            if (GamepassesBody?.["errors"]?.[0]?.["message"] == "Authentication cookie is empty") {
                return new Response(JSON.stringify({ message: "Authentication cookie is empty"}), {status: 407});
            } else if(GamepassesBody?.["errors"]?.[0]?.["message"] == "User is not authenticated") {
                return new Response(JSON.stringify({ message: "Change cookie"}, {status: 201}))
            } else {
                return new Response(JSON.stringify({ message: "Undefined error"}, {status: 407}));
            }
        }

        for (const GamepassResponseData of GamepassesBody["gamePasses"]) {
            const GetImageUrlApiUrlChanged = GetImageUrlApiUrl.replace("{PRODUCTID}", GamepassResponseData["gamePassId"]);
            const GetImageUrlResponse = await fetch(GetImageUrlApiUrlChanged, {method: "GET"});

            if (!GetImageUrlResponse.ok) {
                return GetImageUrlResponse
            }

            const GetImageUrlBody = await GetImageUrlResponse.json();
            const ImageUrl = GetImageUrlBody["data"][0]["imageUrl"]

            const ImageUrlResponse = await fetch(ImageUrl, {method: "GET"});

            if (!ImageUrlResponse.ok) {
                return ImageUrlResponse
            }

            const ImageUrlContent = ImageUrlResponse.arrayBuffer()
            const ImageBlob = new Blob([ImageUrlContent], { type: "image/png" });

            const GamepassData = {}

            GamepassData["Name"] = GamepassResponseData["name"]
            GamepassData["Description"] = GamepassResponseData["description"]
            GamepassData["Price"] = GamepassResponseData["priceInformation"]["defaultPriceInRobux"]
            GamepassData["IsForSale"] = GamepassResponseData["priceInformation"]
            GamepassData["IsRegionalPricingEnabled"] = GamepassResponseData["priceInformation"]["enabledFeatures"].includes["RegionalPricing"]
            //Image
            GamepassData["ImageBlob"] = ImageBlob
            //UniverseId

            Gamepasses.push(GamepassData)
        }

        if (GamepassesBody["cursor"]) {
            await getGamepasses[GamepassesBody["cursor"]]
        }

        return new Response(JSON.stringify({ message: "Success"}, {status: 200}))
    }

    const GamepassResponse = await getGamepasses();
    
    if (!GamepassResponse.ok) {
        return GamepassResponse
    }

    return new Response(JSON.stringify(Gamepasses), { status: 201 })
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname.split(/\//);

        if (path[1] === "gamepass") {
            if (request.method === "GET") {
                const headers = new headers(request.headers);
                
                if (headers.get(HeaderKeyName) !== PeakKey) {
                    return KeyErrorFunction();
                }
                
                const ApiUrl = "https://games.roblox.com/v1/games/" + path[2] + "/game-passes" + url.search

                return fetch(ApiUrl)
            } else {
                return WrongApiErrorFunction(); 
            }
        } else if(path[1] == "copygamepass") {
            if (request.method === "POST") {
                const headers = new Headers(request.headers);

                if (headers.get(HeaderKeyName) !== PeakKey2) {
                    return KeyErrorFunction();
                }
                
                const RequestRawBody = await request.text();
                if (!RequestRawBody.trim()) {
                    return new Response(JSON.stringify({ message: "request body is nil"}), { status: 404 });
                }

                const RequestBody = JSON.parse(RequestRawBody);

                const UniverseId1 = RequestBody.UniverseId1
                const UniverseId2 = RequestBody.UniverseId2

                const GamepassesResponse = await GetGamepasses(UniverseId1)
                
                if (!GamepassesResponse.ok) {
                    return GamepassesResponse
                }

                const Gamepasses = GamepassesResponse.json()

                headers.delete("host");
                headers.delete("roblox-id");
                headers.delete("user-agent");
                headers["user-agent"] = "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36";

                for (const GamepassData of Gamepasses) {
                    const GamepassFormData = new FormData();

                    GamepassFormData.set("Name",                      GamepassData["Name"])
                    GamepassFormData.set("Description",               GamepassData["Description"])
                    GamepassFormData.set("Price",                     GamepassData["Price"])
                    GamepassFormData.set("IsForSale",                 GamepassData["IsForSale"])
                    GamepassFormData.set("IsRegionalPricingEnabled",  GamepassData["IsRegionalPricingEnabled"])
                    GamepassFormData.set("UniverseId",                UniverseId2)
                    GamepassFormData.set("File",                      GamepassData["ImageBlob"])

                    const Init = {
                        method: "POST",
                        headers: headers,
                        body: GamepassFormData
                    }

                    const CreateGamepassResponse = await fetch(CreateGamepassApiUrl, Init)

                    return CreateGamepassResponse
                }
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
