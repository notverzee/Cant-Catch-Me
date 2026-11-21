import { createServer } from "node:http";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { WebSocket, WebSocketServer } from "ws";

const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const MAX_MESSAGES_PER_SECOND = 120;

export function createRelayServer() {
  const rooms = new Map();
  const server = createServer((request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (request.method === "GET" && url.pathname === "/health") {
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ status: "ok" }));
      return;
    }
    response.writeHead(404, { "content-type": "text/plain" });
    response.end("Not found");
  });
  const webSocketServer = new WebSocketServer({ noServer: true, maxPayload: 1024 * 1024 });

  server.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (url.pathname !== "/ws") {
      socket.destroy();
      return;
    }
    webSocketServer.handleUpgrade(request, socket, head, (client) => {
      webSocketServer.emit("connection", client);
    });
  });

  webSocketServer.on("connection", (client) => {
    client.room = null;
    client.role = null;
    client.messageWindowStart = Date.now();
    client.messageCount = 0;

    client.on("message", (rawMessage) => {
      if (!allowMessage(client)) {
        client.close(1008, "Message rate limit exceeded");
        return;
      }

      let packet;
      try {
        packet = JSON.parse(rawMessage.toString());
      } catch {
        send(client, { type: "room-error", code: "invalid-message" });
        return;
      }
      if (!packet || typeof packet !== "object" || Array.isArray(packet)) {
        send(client, { type: "room-error", code: "invalid-message" });
        return;
      }

      if (!client.role) {
        registerClient(client, packet);
        return;
      }
      if (packet.type !== "game-message" || !packet.message || typeof packet.message !== "object" || Array.isArray(packet.message)) return;
      const partner = client.role === "host" ? client.room?.guest : client.room?.host;
      if (partner && partner.readyState === WebSocket.OPEN) {
        send(partner, { type: "game-message", message: packet.message });
      }
    });

    client.on("close", () => removeClient(client));
    client.on("error", (error) => console.error("WebSocket client error:", error.message));
  });

  function registerClient(client, packet) {
    if ((packet.type !== "host" && packet.type !== "join") || !isValidCode(packet.code)) {
      send(client, { type: "room-error", code: "invalid-code" });
      return;
    }
    if (packet.type === "host") {
      if (rooms.has(packet.code)) {
        send(client, { type: "room-error", code: "room-in-use" });
        return;
      }
      const room = { code: packet.code, host: client, guest: null };
      rooms.set(packet.code, room);
      client.room = room;
      client.role = "host";
      send(client, { type: "room-ready", code: packet.code });
      return;
    }

    const room = rooms.get(packet.code);
    if (!room) {
      send(client, { type: "room-error", code: "room-not-found" });
      return;
    }
    if (room.guest) {
      send(client, { type: "room-error", code: "room-full" });
      return;
    }
    room.guest = client;
    client.room = room;
    client.role = "guest";
    send(client, { type: "room-joined" });
    send(room.host, { type: "guest-joined" });
  }

  function removeClient(client) {
    const room = client.room;
    if (!room) return;
    client.room = null;
    if (client.role === "host") {
      if (rooms.get(room.code) === room) rooms.delete(room.code);
      if (room.guest) {
        room.guest.room = null;
        send(room.guest, { type: "host-left" });
      }
    } else if (room.guest === client) {
      room.guest = null;
      send(room.host, { type: "guest-left" });
    }
  }

  const heartbeat = setInterval(() => {
    for (const client of webSocketServer.clients) {
      if (client.isAlive === false) {
        client.terminate();
        continue;
      }
      client.isAlive = false;
      client.ping();
    }
  }, 30000);

  webSocketServer.on("connection", (client) => {
    client.isAlive = true;
    client.on("pong", () => { client.isAlive = true; });
  });

  return {
    server,
    close: async () => {
      clearInterval(heartbeat);
      for (const client of webSocketServer.clients) client.terminate();
      await new Promise((resolve) => webSocketServer.close(resolve));
      if (server.listening) await new Promise((resolve) => server.close(resolve));
    }
  };
}

function isValidCode(code) {
  return typeof code === "string" && code.length === 6 && [...code].every((character) => CODE_ALPHABET.includes(character));
}

function allowMessage(client) {
  const now = Date.now();
  if (now - client.messageWindowStart >= 1000) {
    client.messageWindowStart = now;
    client.messageCount = 0;
  }
  client.messageCount += 1;
  return client.messageCount <= MAX_MESSAGES_PER_SECOND;
}

function send(client, packet) {
  if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify(packet));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const relay = createRelayServer();
  const port = Number(process.env.PORT) || 10000;
  relay.server.listen(port, "0.0.0.0", () => {
    console.log(`Relay listening on port ${port}`);
  });
}
