import { WebSocketServer } from "ws";

const requestCounts = {};  // Store request counts per server
let wss;

export const setupWebSocket = (server) => {
    wss = new WebSocketServer({ server });

    wss.on("connection", (ws) => {
        console.log("WebSocket client connected");
        ws.send(JSON.stringify(requestCounts));
    });
};

export const updateRequestCount = (server) => {
    requestCounts[server] = (requestCounts[server] || 0) + 1;
    
    if (wss) {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(requestCounts));
            }
        });
    }
};
