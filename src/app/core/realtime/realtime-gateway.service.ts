import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { RealtimeConnectionStatus } from './models/connection-status.model';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class RealtimeGatewaysService implements OnDestroy {
  private socket: WebSocket | null = null;

  private readonly stateSubject = new BehaviorSubject<RealtimeConnectionStatus>(
    'idle',
  );
  private readonly messageSubject = new Subject<unknown>();

  readonly status$: Observable<RealtimeConnectionStatus> =
    this.stateSubject.asObservable();
  readonly message$: Observable<unknown> = this.messageSubject.asObservable();

  connect(url: string = environment.wsUrl): void {
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.setStatus('connecting');
    this.socket = new WebSocket(url);

    this.socket.onopen = () => this.setStatus('connected');

    this.socket.onclose = () => {
      this.setStatus('disconnected');
      this.socket = null;
    };

    this.socket.onerror = () => this.setStatus('error');
    this.socket.onmessage = (event: MessageEvent) => {
      try {
        this.messageSubject.next(JSON.parse(String(event.data)));
      } catch {
        console.warn('[RealtimeGateway] Invalid JSON', event.data);
      }
    };
  }
  
  disconnect(): void {
    this.socket?.close();
    this.socket = null;
    this.setStatus('disconnected');
  }

  send(raw: unknown): void {
    if(this.socket?.readyState !== WebSocket.OPEN){
        return;
    }
    const body = typeof raw === 'string' ? raw : JSON.stringify(raw);
    this.socket.send(body);
  }

  ngOnDestroy(): void {
      this.disconnect
  }
  /** Pushes connection status into `status$`; single place components never touch directly. */
  private setStatus(status: RealtimeConnectionStatus): void {
    this.stateSubject.next(status);
  }
}
