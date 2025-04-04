import httpproxy from 'http-proxy';
import  { UserConfig }  from '../models/UserConfigs.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { updateRequestCount } from '../webSocket/wsServer.js';

const proxy = httpproxy.createProxyServer({});
const counters = {};
const stickyMap = {};

const handleRequest = asyncHandler(async (req, res) => {
    const domain = req.headers.host;
    const config = await UserConfig.findOne({ domain });
    if (!config) {
        throw new ApiError(404, 'Configuration not found for this domain');
    }

    if(!activeConnections.has(domain)) {
        activeConnections.set(domain, {});
        for(const server of config.servers) {
            activeConnections.get(domain)[server] = 0;
        }
    }
    const domainConnections = activeConnections.get(domain);

    let target;
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    switch (config.algorithm) {
        case "round-robin":
            const rrIndex = (counters[domain] || 0) % config.servers.length;
            target = config.servers[rrIndex];
            counters[domain] = rrIndex + 1;
            break;

        case "least-connections":
            // Fallback: Simulate by round robin (you can later count connections)
            target = config.servers[0];

        case "random":
            const randIndex = Math.floor(Math.random() * config.servers.length);
            target = config.servers[randIndex];
            break;

        case "weighted-round-robin":
            const weights = config.weights?.length === config.servers.length ? config.weights : Array(config.servers.length).fill(1);
            const weightedList = [];
            config.servers.forEach((server, i) => {
                for (let j = 0; j < weights[i]; j++) {
                    weightedList.push(server);
                }
            });
            const wrIndex = (counters[domain] || 0) % weightedList.length;
            target = weightedList[wrIndex];
            counters[domain] = wrIndex + 1;
            break;

        case "ip-hash":
            const hash = crypto.createHash('sha1').update(clientIP).digest('hex');
            const ipIndex = parseInt(hash.slice(0, 8), 16) % config.servers.length;
            target = config.servers[ipIndex];
            break;

        case "sticky-session":
            if (!stickyMap[domain]) stickyMap[domain] = {};
            if (!stickyMap[domain][clientIP]) {
                const sIndex = (counters[domain] || 0) % config.servers.length;
                stickyMap[domain][clientIP] = config.servers[sIndex];
                counters[domain] = sIndex + 1;
            }
            target = stickyMap[domain][clientIP];
            break;

        case "ml-prediction":
            // Replace with real ML logic
            target = config.servers[0];
            break;

        default:
            target = config.servers[0];
    }

    updateRequestCount(target);

    proxy.web(req, res, { target }, (err) => {
        res.status(502).send("Error forwarding request");
    });
    if (!target) {
        return res.status(500).send("No target server could be selected.");
    }
    
});

export { handleRequest };