import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { WebSocket } from "ws";
import { createRelayServer } from "./server.js";

test("relays a room handshake and game messages, then releases the guest slot", async (t) => {
  const relay = createRelayServer();
  relay.server.listen(0, "127.0.0.1");
  await once(relay.server, "listening");
  t.after(() => relay.close());

  const address = relay.server.address();
  const url = `ws://127.0.0.1:${address.port}/ws`;
  const health = await fetch(`http://127.0.0.1:${address.port}/health`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: "ok" });

  const host = await connect(url);
  const hostReady = nextPacket(host);
  host.send(JSON.stringify({ type: "host", code: "ABC234" }));
  assert.deepEqual(await hostReady, { type: "room-ready", code: "ABC234" });

  const guest = await connect(url);
  const joined = nextPacket(guest);
  const guestJoined = nextPacket(host);
  guest.send(JSON.stringify({ type: "join", code: "ABC234" }));
  assert.deepEqual(await joined, { type: "room-joined" });
  assert.deepEqual(await guestJoined, { type: "guest-joined" });

  const forwarded = nextPacket(host);
  guest.send(JSON.stringify({ type: "game-message", message: { type: "action", action: "cast" } }));
  assert.deepEqual(await forwarded, { type: "game-message", message: { type: "action", action: "cast" } });

  const replacement = await connect(url);
  const fullRoom = nextPacket(replacement);
  replacement.send(JSON.stringify({ type: "join", code: "ABC234" }));
  assert.deepEqual(await fullRoom, { type: "room-error", code: "room-full" });

  const guestLeft = nextPacket(host);
  guest.close();
  assert.deepEqual(await guestLeft, { type: "guest-left" });

  const rejoined = nextPacket(replacement);
  replacement.send(JSON.stringify({ type: "join", code: "ABC234" }));
  assert.deepEqual(await rejoined, { type: "room-joined" });

  const hostLeft = nextPacket(replacement);
  await closeSocket(host);
  assert.deepEqual(await hostLeft, { type: "host-left" });
  await closeSocket(replacement);
});

function connect(url) {
  const client = new WebSocket(url);
  return once(client, "open").then(() => client);
}

function nextPacket(client) {
  return once(client, "message").then(([message]) => JSON.parse(message.toString()));
}

function closeSocket(client) {
  if (client.readyState === WebSocket.CLOSED) return Promise.resolve();
  client.close();
  return once(client, "close");
}
