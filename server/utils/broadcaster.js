/**
 * Broadcast a string message to every open WebSocket client.
 * @param {import('ws').WebSocketServer} wss
 * @param {string} message
 */
function broadcastMessage(wss, message) {
  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(message);
    }
  }
}

module.exports = { broadcastMessage };
