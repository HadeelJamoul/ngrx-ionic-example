# Nursing alert WebSocket server (mock)

Pushes simulated ward alerts for the `ngrx-ionic-example` app.

## Run

```bash
cd server
npm install
npm start
```

Server URL: `ws://localhost:10000`

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `10000` | Listen port |
| `ALERT_INTERVAL_MS` | `4000` | Push interval for random alerts |

## Event types (wire format)

Matches `RawWsMessages` in the Angular app:

```json
{
  "event": "alert.fall_detected",
  "payload": {
    "patientId": "P-1024",
    "room": "12B",
    "severity": "critical",
    "message": "Possible fall detected"
  },
  "sentAt": 1710000000000
}
```

## Client → server

Send JSON to acknowledge an alert:

```json
{
  "event": "alert.ack",
  "payload": { "alertId": "..." },
  "sentAt": 1710000000000
}
```
