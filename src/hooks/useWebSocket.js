import { useEffect, useRef, useState } from "react";
import websocketService from "../services/websocketService";

/**
 * Custom hook for WebSocket connection management
 */
export function useWebSocket() {
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [lastMessage, setLastMessage] = useState(null);
  const unsubscribeRefs = useRef([]);

  useEffect(() => {
    // Subscribe to connection status changes
    const unsubscribeConnection = websocketService.onConnection((status) => {
      setConnectionStatus(status);
    });

    // Subscribe to error events
    const unsubscribeError = websocketService.onError((error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus("error");
    });

    unsubscribeRefs.current.push(unsubscribeConnection, unsubscribeError);

    // Cleanup on unmount
    return () => {
      unsubscribeRefs.current.forEach((unsubscribe) => unsubscribe());
      unsubscribeRefs.current = [];
    };
  }, []);

  const connect = async (token) => {
    try {
      setConnectionStatus("connecting");
      await websocketService.connect(token);
    } catch (error) {
      setConnectionStatus("error");
      throw error;
    }
  };

  const disconnect = () => {
    websocketService.close();
    setConnectionStatus("disconnected");
  };

  const subscribe = (messageType, handler) => {
    const unsubscribe = websocketService.onMessage(messageType, (message) => {
      setLastMessage(message);
      handler(message);
    });

    unsubscribeRefs.current.push(unsubscribe);
    return unsubscribe;
  };

  const send = (message) => {
    return websocketService.send(message);
  };

  return {
    connectionStatus,
    lastMessage,
    connect,
    disconnect,
    subscribe,
    send,
    isConnected: websocketService.isConnected(),
  };
}

/**
 * Hook specifically for framework comparison WebSocket
 */
export function useFrameworkComparison() {
  const { connectionStatus, connect, disconnect, subscribe, send } =
    useWebSocket();
  const [comparisonStatus, setComparisonStatus] = useState(null);
  const [comparisonResults, setComparisonResults] = useState([]);
  const [resultsCount, setResultsCount] = useState(0);

  useEffect(() => {
    // Subscribe to framework comparison messages
    const unsubscribe = subscribe("framework-comparison", (message) => {
      const {
        status,
        data,
        resultsCount: count,
        message: statusMessage,
      } = message;

      setComparisonStatus(status);

      switch (status) {
        case "completed":
          setComparisonResults(data || []);
          setResultsCount(count || 0);
          break;
        case "error":
          console.error("Comparison error:", statusMessage);
          break;
      }
    });

    return unsubscribe;
  }, [subscribe]);

  const startComparison = async (token, userFrameworkId, expertFrameworkId) => {
    try {
      // Connect to WebSocket first
      await connect(token);

      // Wait for connection to be established
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Make API call to start comparison
      const response = await fetch("/api/users/framework-comparisons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userFrameworkId,
          expertFrameworkId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Failed to start comparison");
      }

      return result;
    } catch (error) {
      disconnect();
      throw error;
    }
  };

  return {
    connectionStatus,
    comparisonStatus,
    comparisonResults,
    resultsCount,
    startComparison,
    disconnect,
  };
}
