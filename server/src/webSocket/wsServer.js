// backend/websocket.js
import { WebSocketServer, WebSocket } from "ws";
import { UserConfig } from "../models/UserConfigs.model.js";

const requestCounts = {}; // { "domain": { "server1": count, "server2": count } }
let wss;

export const setupWebSocket = (server) => {
  wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    console.log("WebSocket client connected");
    const urlParams = new URLSearchParams(req.url.split("?")[1]);
    const domain = urlParams.get("domain");

    if (!domain) {
      ws.close(1008, "Domain parameter required");
      return;
    }

    // Initialize request counts for this domain if not present
    if (!requestCounts[domain]) {
      requestCounts[domain] = {};
    }

    // Send initial state for the domain
    ws.send(JSON.stringify(requestCounts[domain]));

    ws.on("error", (err) => {
      console.error("WebSocket error:", err.message);
    });
  });
};

export const updateRequestCount = async (domain, server) => {
  if (!requestCounts[domain]) {
    const config = await UserConfig.findOne({ domain });
    if (config) {
      requestCounts[domain] = {};
      config.servers.forEach((srv) => {
        requestCounts[domain][srv] = 0;
      });
    }
  }

  if (requestCounts[domain] && requestCounts[domain][server] !== undefined) {
    requestCounts[domain][server] = (requestCounts[domain][server] || 0) + 1;
  }

  if (wss) {
    const message = JSON.stringify(requestCounts[domain]);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        const clientDomain = new URLSearchParams(client.url?.split("?")[1]).get(
          "domain"
        );
        if (clientDomain === domain) {
          client.send(message);
        }
      }
    });
  }
};

// Reset counts if needed (e.g., on config change)
export const resetRequestCounts = (domain) => {
  delete requestCounts[domain];
};
