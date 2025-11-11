import { ServerResponse } from "node:http";

/**
 * Server Send Events
 */
export class ServerSentEvent {
  public res: ServerResponse;
  private pingInterval: NodeJS.Timeout | null = null;
  private isClosed = false;

  constructor(res: ServerResponse) {
    this.res = res;

    // 监听连接关闭事件
    this.res.on("close", () => {
      this.dispose();
    });
    this.res.on("error", (err) => {
      this.onError(err);
      this.dispose();
    });
  }

  public onError(err: Error | null | undefined) {
    if (!err) return;
    console.error("sse stream error", err);
  }

  public onClose() {}

  public sendHeaders() {
    if (!this.res.writable || this.res.headersSent || this.isClosed) {
      return;
    }

    this.res.setHeader("Content-Type", "text/event-stream");
    this.res.setHeader("Cache-Control", "no-cache");
    this.res.setHeader("Connection", "keep-alive");
    this.res.flushHeaders();
    this.startPing();
  }

  /**
   * Start sending periodic pings to keep connection alive
   * @param interval Ping interval in milliseconds (default: 30000ms)
   */
  public startPing(interval: number = 30000) {
    if (this.isClosed) {
      return;
    }
    this.stopPing(); // 确保不会创建多个定时器
    this.pingInterval = setInterval(() => this.ping(), interval);
  }

  /**
   * Stop sending periodic pings
   */
  public stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Send ping to keep connection alive
   */
  public ping() {
    if (!this.res.writable || this.isClosed) {
      return;
    }

    if (!this.res.headersSent) {
      this.sendHeaders();
    }

    this.res.write(": ping\n\n", (err) => {
      if (err) this.onError(err);
    });
  }

  /**
   * Send data to client
   */
  public send(data: unknown) {
    if (!this.res.writable || this.isClosed) {
      return;
    }

    if (!this.res.headersSent) {
      this.sendHeaders();
    }

    try {
      this.res.write(`data: ${JSON.stringify(data)}\n\n`, (err) => {
        if (err) this.onError(err);
      });
    } catch (error) {
      this.onError(error as Error);
    }
  }

  /**
   * Close connection
   */
  public end() {
    if (!this.res.writable || this.isClosed) {
      return;
    }

    if (!this.res.headersSent) {
      this.sendHeaders();
    }
    this.res.end("event: close\ndata: \n\n");
    this.dispose();
  }

  /**
   * Dispose all resources
   */
  private dispose() {
    if (this.isClosed) {
      return;
    }

    this.isClosed = true;
    this.stopPing();

    // 确保连接已关闭
    if (this.res.writable && !this.res.destroyed) {
      this.res.end();
    }

    // 移除所有事件监听器
    this.res.removeAllListeners("close");
    this.res.removeAllListeners("error");

    // callback
    this.onClose();
  }
}
