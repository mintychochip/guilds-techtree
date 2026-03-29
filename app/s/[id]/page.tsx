"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TechTreeGraph from "@/app/components/TechTreeGraph";
import "@/app/components/techtree.css";
import "./page.css";

// ── Types ──────────────────────────────────────────────────

interface SessionInfo {
  playerName: string;
  townName: string;
  expiresAt: string;
}

interface TownInfo {
  name: string;
  level: number;
  techPoints: number;
}

interface TreeNode {
  id: string;
  name: string;
  branch: string;
  cost: number;
  positionX: number;
  positionY: number;
  description: string;
  prerequisites: string[];
  status: "unlocked" | "available" | "locked" | "pending";
}

interface TreeEdge {
  from: string;
  to: string;
}

export interface TreeState {
  session: SessionInfo;
  town: TownInfo;
  nodes: TreeNode[];
  edges: TreeEdge[];
}

// ── Connection status badge ────────────────────────────────

function ConnectionStatus({
  status,
}: {
  status: "connecting" | "connected" | "disconnected";
}) {
  return (
    <div className={`connection-status ${status}`}>
      <div className="status-dot" />
      {status === "connecting"
        ? "Connecting to server..."
        : status === "connected"
        ? "Live"
        : "Disconnected"}
    </div>
  );
}

// ── Inner session component (needs Suspense for searchParams) ──

function SessionInner({
  sessionId,
}: {
  sessionId: string;
}) {
  const searchParams = useSearchParams();
  const host = searchParams.get("host") || "localhost:8080";

  const [treeState, setTreeState] = useState<TreeState | null>(null);
  const [pendingNodes, setPendingNodes] = useState<Set<string>>(new Set());
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // ── Connect WebSocket ────────────────────────────────
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${host}/ws/session/${sessionId}`;

    setConnectionStatus("connecting");
    setError(null);

    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
    } catch {
      setError("Invalid server address.");
      setConnectionStatus("disconnected");
      return;
    }
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionStatus("connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "tree_state") {
          setTreeState(data.payload);
          setPendingNodes(new Set());
        } else if (data.type === "unlock_result") {
          if (data.success) {
            setPendingNodes((prev) => {
              const next = new Set(prev);
              if (next.has(data.nodeId)) {
                next.delete(data.nodeId);
              } else {
                next.add(data.nodeId);
              }
              return next;
            });
          }
          if (data.treeState) {
            setTreeState(data.treeState);
          }
        } else if (data.type === "confirmed") {
          setConfirmed(true);
          setPendingNodes(new Set());
          if (data.treeState) {
            setTreeState(data.treeState);
          }
        } else if (data.type === "error") {
          setError(data.message);
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      setConnectionStatus("disconnected");
    };

    ws.onerror = () => {
      setError(
        "Could not connect to the game server. Make sure you ran /techtree web in-game and the server is accessible."
      );
      setConnectionStatus("disconnected");
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [sessionId, host]);

  // ── Actions ──────────────────────────────────────────
  const sendAction = useCallback(
    (action: string, data: Record<string, unknown> = {}) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action, ...data }));
      }
    },
    []
  );

  const handleUnlockNode = useCallback(
    (nodeId: string) => {
      sendAction("unlock", { nodeId });
    },
    [sendAction]
  );

  const handleConfirm = useCallback(() => {
    sendAction("confirm");
  }, [sendAction]);

  const handleCancel = useCallback(() => {
    sendAction("cancel");
    setPendingNodes(new Set());
  }, [sendAction]);

  // ── Render ───────────────────────────────────────────
  if (error && !treeState) {
    return (
      <div className="error-screen">
        <h2>⚠️ Connection Error</h2>
        <p>{error}</p>
        <button className="retry-btn" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  if (confirmed && treeState) {
    return (
      <div className="confirmed-screen">
        <div className="confirmed-card">
          <h1>✅ Changes Applied!</h1>
          <p>
            Your tech tree unlocks have been applied to{" "}
            <strong>{treeState.town.name}</strong>. You can close this tab and
            return to Minecraft.
          </p>
          <div className="confirmed-nodes">
            {treeState.nodes
              .filter((n) => n.status === "unlocked")
              .map((n) => (
                <span key={n.id} className="confirmed-node-badge">
                  {n.name}
                </span>
              ))}
          </div>
        </div>
      </div>
    );
  }

  if (!treeState) {
    return (
      <div className="loading-screen">
        <ConnectionStatus status={connectionStatus} />
        <h2>🌿 Loading Tech Tree...</h2>
        <p style={{ color: "#64748b" }}>Connecting to game server at {host}</p>
      </div>
    );
  }

  return (
    <>
      <ConnectionStatus status={connectionStatus} />
      {error && (
        <div className="toast-error">
          ⚠️ {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}
      <TechTreeGraph
        treeState={treeState}
        onUnlockNode={handleUnlockNode}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        pendingNodes={pendingNodes}
      />
    </>
  );
}

// ── Page with Suspense boundary ────────────────────────────

export default function SessionPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Suspense
      fallback={
        <div className="loading-screen">
          <h2>🌿 Loading...</h2>
        </div>
      }
    >
      <SessionInner sessionId={params.id} />
    </Suspense>
  );
}
