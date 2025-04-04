import httpProxy from 'http-proxy';
import crypto from 'crypto';
import { UserConfig } from '../models/UserConfigs.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { updateRequestCount } from '../webSocket/wsServer.js';

const proxy = httpProxy.createProxyServer({});
const counters = {};
const stickyMap = {};
const activeConnections = {}; // For least-connections tracking

const handleRequest = asyncHandler(async (req, res) => {
  const domain = req.headers.host?.split(':')[0]; // remove port if present
  const config = await UserConfig.findOne({ domain });

  if (!config) {
    throw new ApiError(404, 'Configuration not found for this domain');
  }

  // Initialize connections for least-connections
  if (!activeConnections[domain]) {
    activeConnections[domain] = {};
    config.servers.forEach((s) => (activeConnections[domain][s] = 0));
  }

  let target;
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  switch (config.algorithm) {
    case 'round-robin': {
      const index = (counters[domain] || 0) % config.servers.length;
      target = config.servers[index];
      counters[domain] = index + 1;
      break;
    }

    case 'least-connections': {
      let minConn = Infinity;
      let selected = null;
      for (const server of config.servers) {
        const count = activeConnections[domain][server] || 0;
        if (count < minConn) {
          minConn = count;
          selected = server;
        }
      }
      target = selected;
      break;
    }

    case 'random': {
      const randIndex = Math.floor(Math.random() * config.servers.length);
      target = config.servers[randIndex];
      break;
    }

    case 'weighted-round-robin': {
      const weights = config.weights?.length === config.servers.length
        ? config.weights
        : Array(config.servers.length).fill(1);
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
    }

    case 'ip-hash': {
      const hash = crypto.createHash('sha1').update(clientIP).digest('hex');
      const ipIndex = parseInt(hash.slice(0, 8), 16) % config.servers.length;
      target = config.servers[ipIndex];
      break;
    }

    case 'sticky-session': {
      if (!stickyMap[domain]) stickyMap[domain] = {};
      if (!stickyMap[domain][clientIP]) {
        const sIndex = (counters[domain] || 0) % config.servers.length;
        stickyMap[domain][clientIP] = config.servers[sIndex];
        counters[domain] = sIndex + 1;
      }
      target = stickyMap[domain][clientIP];
      break;
    }

    case 'ml-prediction': {
      target = config.servers[0]; // Replace with real ML logic later
      break;
    }

    default: {
      target = config.servers[0];
    }
  }

  if (!target) {
    return res.status(500).send('No target server could be selected.');
  }

  // Track connections for least-connections
  activeConnections[domain][target] += 1;
  updateRequestCount(target);

  proxy.web(req, res, { target }, (err) => {
    activeConnections[domain][target] = Math.max(activeConnections[domain][target] - 1, 0);
    res.status(502).send('Error forwarding request');
  });

  // Handle request completion to decrement active count
  res.on('close', () => {
    activeConnections[domain][target] = Math.max(activeConnections[domain][target] - 1, 0);
  });
});

export { handleRequest };
