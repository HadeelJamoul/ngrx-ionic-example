// shape of messages received from the WebSocket server before any processing

export interface RawWsMessages {
  event: string;
  payload?: Record<string, unknown>;
  sentAt?: string | number;
}

// Type guard - use in Realtime normalization
// because Raw message data can be garbage so the normalizer check this before mapping
export function isRawWsMessage(value: unknown): value is RawWsMessages {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return typeof candidate['event'] === 'string';
}
