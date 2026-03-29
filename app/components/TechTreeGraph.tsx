"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import cytoscape, { Core, EventObject, NodeSingular } from "cytoscape";
import "./techtree.css";

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

interface TreeState {
  session: SessionInfo;
  town: TownInfo;
  nodes: TreeNode[];
  edges: TreeEdge[];
}

// ── Branch colors ──────────────────────────────────────────

const BRANCH_COLORS: Record<string, string> = {
  INFRASTRUCTURE: "#3b82f6", // blue
  DEFENSE: "#ef4444",        // red
  COMMERCE: "#f59e0b",       // amber
  CULTURE: "#a855f7",        // purple
};

const STATUS_STYLES: Record<string, { bg: string; border: string; label: string }> = {
  unlocked: { bg: "#22c55e", border: "#16a34a", label: "Unlocked" },
  available: { bg: "#eab308", border: "#ca8a04", label: "Available" },
  pending: { bg: "#6366f1", border: "#4f46e5", label: "Pending" },
  locked: { bg: "#6b7280", border: "#4b5563", label: "Locked" },
};

// ── Layout: position branches side by side ─────────────────

const BRANCH_ORDER = ["INFRASTRUCTURE", "DEFENSE", "COMMERCE", "CULTURE"];
const BRANCH_SPACING = 300;
const LEVEL_HEIGHT = 150;
const START_X = 150;

function getNodePosition(node: TreeNode) {
  const branchIdx = BRANCH_ORDER.indexOf(node.branch);
  const x = START_X + branchIdx * BRANCH_SPACING;
  const y = node.positionY * LEVEL_HEIGHT + 100;
  return { x, y };
}

// ── Component ──────────────────────────────────────────────

interface TechTreeGraphProps {
  treeState: TreeState;
  onUnlockNode: (nodeId: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  pendingNodes: Set<string>;
}

export default function TechTreeGraph({
  treeState,
  onUnlockNode,
  onConfirm,
  onCancel,
  pendingNodes,
}: TechTreeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [branchFilter, setBranchFilter] = useState<string>("ALL");

  // ── Initialize Cytoscape ────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || cyRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      elements: [
        ...treeState.nodes.map((node) => ({
          data: {
            ...node,
            id: node.id,
            label: node.name,
          },
          position: getNodePosition(node),
        })),
        ...treeState.edges.map((edge, i) => ({
          data: {
            id: `edge-${i}`,
            source: edge.from,
            target: edge.to,
          },
        })),
      ],
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "text-valign": "center",
            "text-halign": "center",
            "font-size": "12px",
            "font-weight": "bold",
            "text-outline-width": 2,
            "text-outline-color": "#000",
            color: "#fff",
            width: 60,
            height: 60,
            "text-wrap": "wrap",
            "text-max-width": "80px",
            shape: "round-rectangle",
            "background-color": "#6b7280",
            "border-width": 3,
            "border-color": "#4b5563",
          },
        },
        {
          selector: "edge",
          style: {
            width: 3,
            "line-color": "#4b5563",
            "target-arrow-shape": "triangle",
            "target-arrow-color": "#4b5563",
            "curve-style": "bezier",
            "arrow-scale": 0.8,
          },
        },
        {
          selector: "node.branch-INFRASTRUCTURE",
          style: { "border-color": BRANCH_COLORS.INFRASTRUCTURE },
        },
        {
          selector: "node.branch-DEFENSE",
          style: { "border-color": BRANCH_COLORS.DEFENSE },
        },
        {
          selector: "node.branch-COMMERCE",
          style: { "border-color": BRANCH_COLORS.COMMERCE },
        },
        {
          selector: "node.branch-CULTURE",
          style: { "border-color": BRANCH_COLORS.CULTURE },
        },
        {
          selector: "node.status-unlocked",
          style: {
            "background-color": "#22c55e",
            "border-color": "#16a34a",
          },
        },
        {
          selector: "node.status-available",
          style: {
            "background-color": "#eab308",
            "border-color": "#ca8a04",
          },
        },
        {
          selector: "node.status-pending",
          style: {
            "background-color": "#6366f1",
            "border-color": "#4f46e5",
            "border-width": 4,
          },
        },
        {
          selector: "node.status-locked",
          style: {
            "background-color": "#6b7280",
            "border-color": "#4b5563",
            opacity: 0.5,
          },
        },
        {
          selector: "node:selected",
          style: {
            "border-width": 5,
            "border-color": "#fff",
          },
        },
        {
          selector: "node.hidden",
          style: { display: "none" },
        },
        {
          selector: "edge.hidden",
          style: { display: "none" },
        },
      ],
      layout: { name: "preset" },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false,
      wheelSensitivity: 0.3,
    });

    cyRef.current = cy;

    cy.on("tap", "node", (evt: EventObject) => {
      const node = evt.target as NodeSingular;
      setSelectedNode(node.data() as TreeNode);
    });

    cy.on("tap", (evt: EventObject) => {
      if (evt.target === cy) {
        setSelectedNode(null);
      }
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Branch filter ───────────────────────────────────────
  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    if (branchFilter === "ALL") {
      cy.nodes().removeClass("hidden");
      cy.edges().removeClass("hidden");
    } else {
      cy.nodes().forEach((node) => {
        const branch = node.data("branch");
        if (branch === branchFilter) {
          node.removeClass("hidden");
        } else {
          node.addClass("hidden");
        }
      });
      cy.edges().forEach((edge) => {
        const src = cy.getElementById(edge.data("source"));
        const tgt = cy.getElementById(edge.data("target"));
        if (
          src.hasClass("hidden") ||
          tgt.hasClass("hidden")
        ) {
          edge.addClass("hidden");
        } else {
          edge.removeClass("hidden");
        }
      });
    }
  }, [branchFilter]);

  // ── Update node styles when state changes ───────────────
  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    treeState.nodes.forEach((node) => {
      const cyNode = cy.getElementById(node.id);
      if (cyNode.length) {
        cyNode.data(node);
        cyNode.removeClass("unlocked available locked pending");
        cyNode.addClass(`status-${node.status}`);
        cyNode.removeClass("hidden");
      }
    });

    // Re-apply filter
    if (branchFilter !== "ALL") {
      cy.nodes().forEach((n) => {
        if (n.data("branch") !== branchFilter) {
          n.addClass("hidden");
        }
      });
    }
  }, [treeState, pendingNodes, branchFilter]);

  const totalCost = treeState.nodes
    .filter((n) => pendingNodes.has(n.id))
    .reduce((sum, n) => sum + n.cost, 0);

  const canAfford = treeState.town.techPoints >= totalCost;

  return (
    <div className="techtree-container">
      {/* Header */}
      <div className="techtree-header">
        <div className="techtree-title">
          <h1>🌿 Town Tech Tree</h1>
          <div className="techtree-meta">
            <span className="badge town-badge">
              🏘️ {treeState.town.name} (Lv.{treeState.town.level})
            </span>
            <span className="badge points-badge">
              ⭐ {treeState.town.techPoints - totalCost} tech points remaining
            </span>
            <span className="badge player-badge">
              👤 {treeState.session.playerName}
            </span>
          </div>
        </div>

        {/* Branch filter */}
        <div className="branch-filters">
          {["ALL", ...BRANCH_ORDER].map((b) => (
            <button
              key={b}
              className={`filter-btn ${
                branchFilter === b ? "active" : ""
              } ${b !== "ALL" ? `branch-${b.toLowerCase()}` : ""}`}
              onClick={() => setBranchFilter(b)}
            >
              {b === "ALL" ? "🌐 All" : b === "INFRASTRUCTURE" ? "🏗️" : b === "DEFENSE" ? "⚔️" : b === "COMMERCE" ? "💰" : "🎭"}{" "}
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Graph */}
      <div ref={containerRef} className="techtree-canvas" />

      {/* Node detail panel */}
      {selectedNode && (
        <div className={`node-panel status-${selectedNode.status}`}>
          <button className="close-btn" onClick={() => setSelectedNode(null)}>
            ✕
          </button>
          <div
            className="node-panel-header"
            style={{
              borderColor: BRANCH_COLORS[selectedNode.branch] || "#666",
            }}
          >
            <h2>{selectedNode.name}</h2>
            <span className="branch-tag">{selectedNode.branch}</span>
          </div>
          <p className="node-description">{selectedNode.description}</p>
          <div className="node-stats">
            <div className="stat">
              <span className="stat-label">Cost</span>
              <span className="stat-value">⭐ {selectedNode.cost}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Status</span>
              <span className={`status-badge ${selectedNode.status}`}>
                {STATUS_STYLES[selectedNode.status]?.label}
              </span>
            </div>
            {selectedNode.prerequisites.length > 0 && (
              <div className="stat">
                <span className="stat-label">Requires</span>
                <span className="stat-value">
                  {selectedNode.prerequisites.join(", ")}
                </span>
              </div>
            )}
          </div>
          {selectedNode.status === "available" && (
            <button
              className="unlock-btn"
              onClick={() => onUnlockNode(selectedNode.id)}
            >
              {pendingNodes.has(selectedNode.id)
                ? "✓ Queued"
                : "🔓 Unlock"}
            </button>
          )}
          {pendingNodes.has(selectedNode.id) && (
            <button
              className="cancel-node-btn"
              onClick={() => onUnlockNode(selectedNode.id)}
            >
              ↩ Remove from queue
            </button>
          )}
        </div>
      )}

      {/* Action bar */}
      {pendingNodes.size > 0 && (
        <div className="action-bar">
          <div className="action-info">
            <span>
              {pendingNodes.size} node{pendingNodes.size > 1 ? "s" : ""} queued
            </span>
            <span className="action-cost">
              Total cost: ⭐ {totalCost}
            </span>
            {!canAfford && (
              <span className="action-warning">
                ⚠️ Not enough tech points!
              </span>
            )}
          </div>
          <div className="action-buttons">
            <button className="cancel-btn" onClick={onCancel}>
              Cancel
            </button>
            <button
              className={`confirm-btn ${canAfford ? "" : "disabled"}`}
              onClick={canAfford ? onConfirm : undefined}
              disabled={!canAfford}
            >
              ✓ Confirm Unlocks
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
