/**
 * Enhanced WebSocket Service with reconnection and error handling
 */

class WebSocketService {
  constructor() {
    this.ws = null;
    this.url = null;
    this.token = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 1000;
    this.isConnecting = false;
    this.isManualClose = false;
    this.messageHandlers = new Map();
    this.connectionHandlers = [];
    this.errorHandlers = [];
  }

  /**
   * Connect to WebSocket with automatic reconnection
   */
  connect(token, endpoint = "/ws/framework-comparisons") {
    if (
      this.isConnecting ||
      (this.ws && this.ws.readyState === WebSocket.OPEN)
    ) {
      return Promise.resolve();
    }

    this.token = token;
    this.url = `${import.meta.env.VITE_WS_BASE_URL}${endpoint}?token=${token}`;
    this.isConnecting = true;
    this.isManualClose = false;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.connectionHandlers.forEach((handler) => handler("connected"));
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };

        this.ws.onclose = (event) => {
          this.isConnecting = false;
          this.connectionHandlers.forEach((handler) => handler("disconnected"));

          // Auto-reconnect if not a manual close and not a normal closure
          if (!this.isManualClose && event.code !== 1000) {
            this.attemptReconnect();
          }
        };

        this.ws.onerror = (error) => {
          this.isConnecting = false;
          this.errorHandlers.forEach((handler) => handler(error));
          reject(error);
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.errorHandlers.forEach((handler) =>
        handler(new Error("Max reconnection attempts reached"))
      );
      return;
    }

    this.reconnectAttempts++;
    const delay =
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      if (!this.isManualClose && this.token) {
        this.connect(this.token);
      }
    }, delay);
  }

  /**
   * Handle incoming messages
   */
  handleMessage(message) {
    const { type } = message;

    if (this.messageHandlers.has(type)) {
      this.messageHandlers.get(type).forEach((handler) => handler(message));
    }

    // Handle connection status messages
    if (type === "connection") {
      this.connectionHandlers.forEach((handler) => handler(message.status));
    }
  }

  /**
   * Add message handler for specific message type
   */
  onMessage(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type).push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.messageHandlers.get(type);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Add connection status handler
   */
  onConnection(handler) {
    this.connectionHandlers.push(handler);

    // Return unsubscribe function
    return () => {
      const index = this.connectionHandlers.indexOf(handler);
      if (index > -1) {
        this.connectionHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Add error handler
   */
  onError(handler) {
    this.errorHandlers.push(handler);

    // Return unsubscribe function
    return () => {
      const index = this.errorHandlers.indexOf(handler);
      if (index > -1) {
        this.errorHandlers.splice(index, 1);
      }
    };
  }

  /**
   * Send message through WebSocket
   */
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  /**
   * Close WebSocket connection
   */
  close() {
    this.isManualClose = true;
    if (this.ws) {
      this.ws.close(1000, "Manual close");
      this.ws = null;
    }
    this.messageHandlers.clear();
    this.connectionHandlers = [];
    this.errorHandlers = [];
  }

  /**
   * Get current connection state
   */
  getState() {
    if (!this.ws) return "disconnected";

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return "connecting";
      case WebSocket.OPEN:
        return "connected";
      case WebSocket.CLOSING:
        return "closing";
      case WebSocket.CLOSED:
        return "disconnected";
      default:
        return "unknown";
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

export default websocketService;
