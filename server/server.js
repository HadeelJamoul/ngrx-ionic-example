const WebSocket = require('ws');
const { broadcastMessage } = require('./utils/broadcaster');

const ALERT_TEMPLATES = [
  {
    event: 'alert.fall_detected',
    payload: {
      patientId: 'P-1024',
      room: '12B',
      bed: '2',
      severity: 'critical',
      message: 'Possible fall detected — immediate check required',
    },
  },
  {
    event: 'alert.bed_exit',
    payload: {
      patientId: 'P-2048',
      room: '8A',
      bed: '1',
      severity: 'high',
      message: 'Patient left bed without assistance',
    },
  },
  {
    event: 'alert.vital_sign',
    payload: {
      patientId: 'P-3099',
      room: '4C',
      bed: '3',
      severity: 'medium',
      message: 'Heart rate above threshold (118 bpm)',
    },
  },
  {
    event: 'alert.system',
    payload: {
      severity: 'low',
      message: 'Ward monitoring connection stable',
    },
  },
];

/**
 * @param {number} [port]
 * @returns {import('ws').WebSocketServer}
 */
function createWebSocketServer(port = 10000) {
  const listenPort = Number(process.env.PORT) || port;
  const wss = new WebSocket.Server({ port: listenPort });

  console.log(`WebSocket alert server listening on ws://localhost:${listenPort}`);

  wss.on('connection', function connection(ws) {
    console.log('Nurse station client connected');

    ws.send(
      JSON.stringify({
        event: 'alert.system',
        payload: {
          severity: 'low',
          message: 'Connected to ward alert hub',
        },
        sentAt: Date.now(),
      })
    );

    ws.on('message', function incoming(data) {
      try {
        const message = data.toString();
        console.log('Received from client:', message);

        let parsed;
        try {
          parsed = JSON.parse(message);
        } catch {
          parsed = null;
        }

        if (parsed?.event === 'alert.ack') {
          console.log('Alert acknowledged:', parsed.payload);
          broadcastMessage(
            wss,
            JSON.stringify({
              event: 'alert.ack_confirmed',
              payload: parsed.payload,
              sentAt: Date.now(),
            })
          );
          return;
        }

        broadcastMessage(wss, message);
      } catch (err) {
        console.error('Failed to handle message:', err);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  const pushIntervalMs = Number(process.env.ALERT_INTERVAL_MS) || 4000;

  setInterval(() => {
    const template =
      ALERT_TEMPLATES[Math.floor(Math.random() * ALERT_TEMPLATES.length)];
    const alert = {
      ...template,
      sentAt: Date.now(),
    };
    const data = JSON.stringify(alert);
    broadcastMessage(wss, data);
    console.log('Pushed alert:', alert.event, alert.payload?.room ?? '');
  }, pushIntervalMs);

  return wss;
}

module.exports = { createWebSocketServer };
