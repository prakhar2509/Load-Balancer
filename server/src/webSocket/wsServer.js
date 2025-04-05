import { WebSocketServer, WebSocket } from "ws";

const requestCounts = {};  // Store request counts per server
let wss;

/**
 * Initializes the WebSocket server
 * @param {http.Server} server - The HTTP server instance to bind WebSocket to
 */
export const setupWebSocket = (server) => {
    wss = new WebSocketServer({ server });

    wss.on("connection", (ws) => {
        console.log("WebSocket client connected");

        // Send the current state on connection
        ws.send(JSON.stringify(requestCounts));

        // Optional: Handle unexpected close
        ws.on("error", (err) => {
            console.error("WebSocket error:", err.message);
        });
    });
};

/**
 * Update request count for a specific backend server
 * and broadcast the updated count to all WebSocket clients
 * @param {string} server - The server URL (e.g., http://localhost:4000)
 */
export const updateRequestCount = (server) => {
    requestCounts[server] = (requestCounts[server] || 0) + 1;

    if (wss) {
        const message = JSON.stringify(requestCounts);

        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
};
