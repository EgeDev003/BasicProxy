const PeakKey = "X9G7B4QW8L0FJ2RMK5YP3ZSA1HVT6CND"

// Export our request handler
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname.split(/\//);

        if (path[1] === "gamepass") {
            return new Response(JSON.stringify({ message: "yes"}), { status: 400 })
        }
        
        const headers = new Headers(request.headers);
        headers.delete("host");
        headers.delete("roblox-id");
        headers.delete("user-agent");
        headers["user-agent"] = "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36";

        console.log(headers.get("key"))
        if (headers.get("key") !== PeakKey) {
            return new Response(JSON.stringify({ message: "Key is not true"}), { status: 400 });
        }
        
        const init = {
            method: request.method,
            headers,
        };

        if (request.method !== "GET" && request.method !== "HEAD") {
            init.body = await request.text();
        }
    }
};
