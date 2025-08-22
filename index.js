const CreateGamepassApiUrl = "https://apis.roblox.com" 

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname.split(/\//);

        const headers = new Headers(request.headers);

        headers.delete("host");
        headers.delete("roblox-id");
        headers.delete("user-agent");
        headers["user-agent"] = "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36";

        if (path[1] === "deneme") {
            const form = new FormData();
            
            console.log(headers.get("content-type"))

            form.append("UniverseId", headers.get("UniverseId"))
            form.append("Name", headers.get("Name"))
            form.append("Description", headers.get("Description"))
            form.append("IsRegionalPricingEnabled", headers.get("IsRegionalPricingEnabled"))
            form.append("IsForSale", headers.get("IsForSale"))
            form.append("File", headers.get("ImageData"))

            if (headers.get("Price")) {
                form.append("Price", headers.get("Price"))   
            }
            
            const init = {
                method: "POST",
                headers: headers,
                body: form
            }

            return fetch(CreateGamepassApiUrl, init)
        } else {
            const RequestUrl = `https://${path[1]}.roblox.com/${path.slice(2).join("/")}${url.search}`
    
            const init = {
                method: request.method,
                headers: headers,
            };
            
            if (request.method !== "GET" && request.method !== "HEAD") {
                init.body = await request.text();
            }
    
            return fetch(RequestUrl, init)
        }
    }
}
