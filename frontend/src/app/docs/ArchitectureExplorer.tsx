"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, FileText, Scale, Zap } from "lucide-react";
import {
  DEFAULT_ARCHITECTURE_SYSTEMS,
  ArchitectureSystem,
  ArchitectureNode,
  ExecutionStep,
  SystemMetrics,
} from "./architectureData";

const SYSTEM_ICON_MAP = {
  chat: Sparkles,
  contract: FileText,
  lawyer: Scale,
  mcp: Zap,
};

const SYSTEM_THEME_MAP = {
  chat: { color: "#C45B3C", bg: "#FDF2EE", border: "rgba(196, 91, 60, 0.25)" },
  contract: { color: "#B45309", bg: "#FEF7EE", border: "rgba(180, 83, 9, 0.25)" },
  lawyer: { color: "#1E5C40", bg: "#EEF7F2", border: "rgba(30, 92, 64, 0.25)" },
  mcp: { color: "#D97706", bg: "#FFFBEB", border: "rgba(217, 119, 6, 0.25)" },
};

interface ArchitectureExplorerProps {
  apiBase?: string;
  initialSystemId?: "chat" | "contract" | "lawyer" | "mcp";
}

export default function ArchitectureExplorer({
  apiBase = "http://127.0.0.1:8000",
  initialSystemId = "chat",
}: ArchitectureExplorerProps) {
  // Systems dataset (starts with authentic pre-compiled defaults, updates if API responds)
  const [systems, setSystems] = useState<Record<"chat" | "contract" | "lawyer" | "mcp", ArchitectureSystem>>(
    DEFAULT_ARCHITECTURE_SYSTEMS
  );
  const [activeSystemId, setActiveSystemId] = useState<"chat" | "contract" | "lawyer" | "mcp">(initialSystemId);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [animateFlow, setAnimateFlow] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedEndpoint, setCopiedEndpoint] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Sync with live backend architecture API if reachable
  useEffect(() => {
    fetch(`${apiBase}/api/docs/architecture`)
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Architecture API offline");
      })
      .then((payload) => {
        if (payload && payload.systems) {
          setSystems((prev) => ({
            ...prev,
            ...payload.systems,
          }));
        }
      })
      .catch(() => {
        // Gracefully stay on authentic verified local dataset
      });
  }, [apiBase]);

  const activeSystem = systems[activeSystemId] || DEFAULT_ARCHITECTURE_SYSTEMS[activeSystemId];

  // Handle system switch
  const handleSystemChange = (sysId: "chat" | "contract" | "lawyer" | "mcp") => {
    setActiveSystemId(sysId);
    setSelectedNodeId(null);
    setHoveredNodeId(null);
    setZoomLevel(1);
  };

  // Copy endpoint utility
  const copyEndpoint = (endpoint: string) => {
    navigator.clipboard.writeText(endpoint);
    setCopiedEndpoint(true);
    setTimeout(() => setCopiedEndpoint(false), 2000);
  };

  // Export current SVG as downloadable file
  const downloadSvg = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `advotech-${activeSystemId}-architecture.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((z) => Math.min(1.5, Math.round((z + 0.15) * 100) / 100));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.7, Math.round((z - 0.15) * 100) / 100));
  const handleZoomReset = () => setZoomLevel(1);

  return (
    <div
      ref={containerRef}
      className={`arch-master-wrapper${isFullscreen ? " fullscreen-modal" : ""}`}
      style={{
        position: isFullscreen ? "fixed" : "relative",
        top: isFullscreen ? 0 : undefined,
        left: isFullscreen ? 0 : undefined,
        width: isFullscreen ? "100vw" : "100%",
        height: isFullscreen ? "100vh" : "auto",
        zIndex: isFullscreen ? 99999 : undefined,
        background: "#FBF4EC",
        overflowY: isFullscreen ? "auto" : undefined,
        padding: isFullscreen ? "2rem" : 0,
      }}
    >
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. SYSTEM SELECTOR BAR (Hearth-styled Pills)              */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="arch-flow-selector-bar">
        <div className="arch-selector-headline">
          <span className="arch-selector-prefix">ARCHITECTURE EXPLORER:</span>
          <span className="arch-selector-subtitle">Select a core subsystem to inspect real backend execution</span>
        </div>
        <div className="arch-flow-pills">
          {(["chat", "contract", "lawyer", "mcp"] as const).map((id) => {
            const sys = systems[id];
            const isActive = activeSystemId === id;
            const Icon = SYSTEM_ICON_MAP[id];
            const theme = SYSTEM_THEME_MAP[id];

            return (
              <button
                key={id}
                type="button"
                className={`arch-flow-pill${isActive ? " active" : ""}`}
                onClick={() => handleSystemChange(id)}
              >
                <div
                  className="pill-icon-badge"
                  style={{
                    backgroundColor: theme.bg,
                    color: theme.color,
                    borderColor: theme.border,
                  }}
                >
                  <Icon size={19} strokeWidth={2.3} />
                </div>
                <div className="pill-title-wrap">
                  <span className="pill-title">{sys.short_title}</span>
                </div>
                <span className="pill-version">{sys.version}</span>
                {isActive && <span className="pill-live-dot" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. SYSTEM TELEMETRY & VERIFIED TECHNICAL INSIGHTS STRIP    */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="arch-telemetry-card">
        <div className="arch-telemetry-header">
          <div className="arch-telemetry-left">
            <div className="arch-telemetry-tags">
              <span className="arch-pill-tag brand">{activeSystem.runtime}</span>
              <span className="arch-pill-tag pattern">{activeSystem.design_pattern}</span>
            </div>
            <h3 className="arch-system-title">
              <span
                className="title-icon-badge"
                style={{
                  color: SYSTEM_THEME_MAP[activeSystemId].color,
                  backgroundColor: SYSTEM_THEME_MAP[activeSystemId].bg,
                  borderColor: SYSTEM_THEME_MAP[activeSystemId].border,
                }}
              >
                {React.createElement(SYSTEM_ICON_MAP[activeSystemId], { size: 20, strokeWidth: 2.3 })}
              </span>
              {activeSystem.title}
            </h3>
            <p className="arch-system-tagline">{activeSystem.tagline}</p>
          </div>

          <div className="arch-telemetry-right">
            <div className="arch-endpoint-box">
              <span className="arch-endpoint-label">API ROUTE:</span>
              <code className="arch-endpoint-code">{activeSystem.endpoint}</code>
              <button
                type="button"
                className="arch-copy-btn"
                onClick={() => copyEndpoint(activeSystem.endpoint)}
                title="Copy API Route"
              >
                {copiedEndpoint ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>

        {/* 4 Technical KPI Insight Tiles */}
        <div className="arch-metric-tiles-grid">
          <div className="arch-metric-tile">
            <span className="tile-label">EXECUTION LATENCY</span>
            <span className="tile-value">{activeSystem.metrics.latency}</span>
            <span className="tile-hint">Sovereign Async Engine</span>
          </div>
          <div className="arch-metric-tile">
            <span className="tile-label">VERIFIED CORPUS</span>
            <span className="tile-value">{activeSystem.metrics.corpus_size}</span>
            <span className="tile-hint">Bangladesh Gazette Index</span>
          </div>
          <div className="arch-metric-tile">
            <span className="tile-label">PRIMARY INFERENCE</span>
            <span className="tile-value">{activeSystem.metrics.primary_model}</span>
            <span className="tile-hint">Fallback: {activeSystem.metrics.fallback_model}</span>
          </div>
          <div className="arch-metric-tile">
            <span className="tile-label">VERIFICATION METHOD</span>
            <span className="tile-value highlight">{activeSystem.metrics.verification_method}</span>
            <span className="tile-hint">{activeSystem.metrics.accuracy_score}</span>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. CANVAS CONTROLS TOOLBAR                                 */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="arch-canvas-toolbar">
        <div className="toolbar-left">
          <span className="canvas-badge">
            <span className="pulse-indicator" />
            LIVE BACKEND TOPOLOGY ({activeSystem.nodes.length} NODES · {activeSystem.connections.length} FLOWS)
          </span>
          <span className="canvas-help-text">Click any component to inspect data contracts & source code</span>
        </div>

        <div className="toolbar-actions">
          {/* Zoom controls */}
          <div className="zoom-btn-group">
            <button type="button" onClick={handleZoomOut} title="Zoom Out" className="tb-btn">
              −
            </button>
            <span className="zoom-label">{Math.round(zoomLevel * 100)}%</span>
            <button type="button" onClick={handleZoomIn} title="Zoom In" className="tb-btn">
              +
            </button>
            <button type="button" onClick={handleZoomReset} title="Reset Scale" className="tb-btn">
              ↺
            </button>
          </div>

          {/* Animate Flow Toggle */}
          <button
            type="button"
            className={`tb-btn toggle-btn${animateFlow ? " active" : ""}`}
            onClick={() => setAnimateFlow(!animateFlow)}
            title="Toggle animated data packet flows"
          >
            {animateFlow ? "⚡ Animated" : "⏹ Static"}
          </button>

          {/* Export SVG */}
          <button type="button" onClick={downloadSvg} className="tb-btn action-btn" title="Download standalone SVG">
            ⬇ Export SVG
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="tb-btn action-btn"
            title="Toggle Fullscreen Explorer"
          >
            {isFullscreen ? "✕ Exit Fullscreen" : "⛶ Fullscreen"}
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 4. DYNAMIC INTERACTIVE SVG CANVAS                          */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="svg-canvas-container" style={{ overflow: zoomLevel > 1 ? "auto" : "hidden", width: "100%" }}>
        <div
          className="svg-zoom-wrapper"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: "top left",
            transition: "transform 0.2s ease-out",
            width: "100%",
            maxWidth: "100%",
          }}
        >
          <svg
            ref={svgRef}
            viewBox="0 0 1060 250"
            className="arch-svg-canvas"
            style={{ width: "100%", height: "auto", display: "block" }}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Arrow Marker: Primary Terracotta */}
              <marker
                id="arch-arrow"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#C45B3C" />
              </marker>

              {/* Arrow Marker: Emerald Return Stream */}
              <marker
                id="arch-return-arrow"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#1E5C40" />
              </marker>

              {/* Arrow Marker: Fallback/Tool Gold */}
              <marker
                id="arch-tool-arrow"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#8F5A0A" />
              </marker>

              {/* Node Card Gradient */}
              <linearGradient id="nodeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#FFFDF9" />
              </linearGradient>

              {/* Selected Node Glow */}
              <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#C45B3C" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* ── RENDER SYSTEM SPECIFIC TOPOLOGY ── */}
            {activeSystemId === "chat" && (
              <ChatTopology
                nodes={activeSystem.nodes}
                selectedNodeId={selectedNodeId}
                hoveredNodeId={hoveredNodeId}
                animateFlow={animateFlow}
                onSelectNode={setSelectedNodeId}
                onHoverNode={setHoveredNodeId}
              />
            )}

            {activeSystemId === "contract" && (
              <ContractTopology
                nodes={activeSystem.nodes}
                selectedNodeId={selectedNodeId}
                hoveredNodeId={hoveredNodeId}
                animateFlow={animateFlow}
                onSelectNode={setSelectedNodeId}
                onHoverNode={setHoveredNodeId}
              />
            )}

            {activeSystemId === "lawyer" && (
              <LawyerTopology
                nodes={activeSystem.nodes}
                selectedNodeId={selectedNodeId}
                hoveredNodeId={hoveredNodeId}
                animateFlow={animateFlow}
                onSelectNode={setSelectedNodeId}
                onHoverNode={setHoveredNodeId}
              />
            )}

            {activeSystemId === "mcp" && (
              <McpTopology
                nodes={activeSystem.nodes}
                selectedNodeId={selectedNodeId}
                hoveredNodeId={hoveredNodeId}
                animateFlow={animateFlow}
                onSelectNode={setSelectedNodeId}
                onHoverNode={setHoveredNodeId}
              />
            )}
          </svg>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 5. SCOPED STYLES (Preserving Hearth Theme Design Tokens)   */}
      {/* ────────────────────────────────────────────────────────── */}
      <style jsx>{`
        .arch-master-wrapper {
          margin-top: 1.5rem;
          margin-bottom: 2.5rem;
          border: 1px solid #ecdfd0;
          border-radius: 14px;
          background: #fbf4ec;
          box-shadow: 0 6px 24px rgba(46, 33, 23, 0.04);
          overflow: hidden;
          font-family: inherit;
        }

        /* 1. Selector Bar */
        .arch-flow-selector-bar {
          background: #fffdf9;
          border-bottom: 1px solid #ecdfd0;
          padding: 1.25rem 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .arch-selector-headline {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .arch-selector-prefix {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: #c45b3c;
          text-transform: uppercase;
        }
        .arch-selector-subtitle {
          font-size: 0.88rem;
          color: #786b60;
        }
        .arch-flow-pills {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.85rem;
        }
        @media (max-width: 900px) {
          .arch-flow-pills {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 520px) {
          .arch-flow-pills {
            grid-template-columns: 1fr;
          }
        }
        .arch-flow-pill {
          background: #fbf4ec;
          border: 1.5px solid #eadbcc;
          border-radius: 10px;
          padding: 0.9rem 1.1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          font-family: inherit;
          text-align: left;
          position: relative;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .arch-flow-pill:hover {
          border-color: #c45b3c;
          background: #ffffff;
          transform: translateY(-1.5px);
          box-shadow: 0 6px 16px rgba(46, 33, 23, 0.06);
        }
        .arch-flow-pill.active {
          background: #ffffff;
          border-color: #c45b3c;
          box-shadow: 0 6px 20px rgba(196, 91, 60, 0.12), 0 2px 4px rgba(46, 33, 23, 0.04);
        }
        .pill-icon-badge {
          width: 38px;
          height: 38px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.2s ease;
        }
        .arch-flow-pill:hover .pill-icon-badge {
          transform: scale(1.08);
        }
        .pill-title-wrap {
          flex-grow: 1;
          min-width: 0;
        }
        .pill-title {
          font-family: var(--font-fraunces), serif;
          font-size: 0.96rem;
          font-weight: 700;
          color: #2e2117;
          line-height: 1.25;
          letter-spacing: -0.01em;
          display: block;
        }
        .arch-flow-pill.active .pill-title {
          color: #c45b3c;
        }
        .pill-version {
          font-size: 0.68rem;
          font-family: monospace;
          background: #f0e6da;
          padding: 0.2rem 0.5rem;
          border-radius: 5px;
          color: #5c4f43;
          font-weight: 700;
          flex-shrink: 0;
          letter-spacing: 0.02em;
        }
        .pill-live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #1e5c40;
          box-shadow: 0 0 0 2.5px rgba(30, 92, 64, 0.25);
          position: absolute;
          top: 9px;
          right: 9px;
        }
        .title-icon-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          border: 1px solid transparent;
          margin-right: 0.6rem;
          vertical-align: middle;
        }

        /* 2. Telemetry Card */
        .arch-telemetry-card {
          padding: 1.5rem 1.75rem;
          background: #fffdf9;
          border-bottom: 1px solid #ecdfd0;
        }
        .arch-telemetry-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1.5rem;
          flex-wrap: wrap;
          margin-bottom: 1.25rem;
        }
        .arch-telemetry-tags {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .arch-pill-tag {
          font-size: 0.68rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
        }
        .arch-pill-tag.brand {
          background: rgba(196, 91, 60, 0.1);
          color: #c45b3c;
        }
        .arch-pill-tag.pattern {
          background: #ecdfd0;
          color: #5c4f43;
        }
        .arch-system-title {
          font-family: var(--font-fraunces), serif;
          font-size: 1.4rem;
          color: #2e2117;
          margin: 0 0 0.35rem 0;
          font-weight: 700;
        }
        .arch-system-tagline {
          font-size: 0.9rem;
          color: #5c4f43;
          margin: 0;
          max-width: 650px;
          line-height: 1.45;
        }
        .arch-endpoint-box {
          background: #fbf4ec;
          border: 1px solid #ecdfd0;
          border-radius: 6px;
          padding: 0.5rem 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .arch-endpoint-label {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #786b60;
        }
        .arch-endpoint-code {
          font-family: monospace;
          font-size: 0.82rem;
          font-weight: 700;
          color: #c45b3c;
        }
        .arch-copy-btn {
          background: #ffffff;
          border: 1px solid #ecdfd0;
          padding: 0.2rem 0.55rem;
          border-radius: 4px;
          font-size: 0.72rem;
          font-weight: 700;
          color: #2e2117;
          cursor: pointer;
        }
        .arch-copy-btn:hover {
          border-color: #c45b3c;
          color: #c45b3c;
        }

        .arch-metric-tiles-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-top: 1rem;
        }
        @media (max-width: 860px) {
          .arch-metric-tiles-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 500px) {
          .arch-metric-tiles-grid {
            grid-template-columns: 1fr;
          }
        }
        .arch-metric-tile {
          background: #fbf4ec;
          border: 1px solid #ecdfd0;
          border-radius: 8px;
          padding: 0.85rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .tile-label {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #786b60;
        }
        .tile-value {
          font-family: var(--font-fraunces), serif;
          font-size: 1.15rem;
          font-weight: 700;
          color: #2e2117;
          line-height: 1.25;
        }
        .tile-value.highlight {
          color: #1e5c40;
          font-size: 1rem;
        }
        .tile-hint {
          font-size: 0.72rem;
          color: #786b60;
        }

        /* 3. Canvas Toolbar */
        .arch-canvas-toolbar {
          background: #fbf4ec;
          border-bottom: 1px solid #ecdfd0;
          padding: 0.75rem 1.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .toolbar-left {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          flex-wrap: wrap;
        }
        .canvas-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #2e2117;
          background: #fffdf9;
          border: 1px solid #ecdfd0;
          padding: 0.25rem 0.6rem;
          border-radius: 50px;
        }
        .pulse-indicator {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #1e5c40;
          box-shadow: 0 0 0 2px rgba(30, 92, 64, 0.2);
        }
        .canvas-help-text {
          font-size: 0.78rem;
          color: #786b60;
          font-style: italic;
        }
        .toolbar-actions {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-wrap: wrap;
        }
        .zoom-btn-group {
          display: flex;
          align-items: center;
          background: #ffffff;
          border: 1px solid #ecdfd0;
          border-radius: 6px;
          overflow: hidden;
        }
        .tb-btn {
          background: #ffffff;
          border: 1px solid #ecdfd0;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #2e2117;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s ease;
        }
        .zoom-btn-group .tb-btn {
          border: none;
          border-radius: 0;
          padding: 0.35rem 0.6rem;
        }
        .zoom-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #5c4f43;
          padding: 0 0.4rem;
          min-width: 44px;
          text-align: center;
        }
        .tb-btn:hover {
          background: #fbf4ec;
          border-color: #c45b3c;
          color: #c45b3c;
        }
        .tb-btn.toggle-btn.active {
          background: rgba(196, 91, 60, 0.1);
          color: #c45b3c;
          border-color: #c45b3c;
        }
        .tb-btn.small {
          padding: 0.25rem 0.55rem;
          font-size: 0.7rem;
        }

        /* 4. Canvas Container */
        .svg-canvas-container {
          background: #fbf4ec;
          padding: 1.25rem 1.5rem;
          position: relative;
          width: 100%;
          overflow: hidden;
        }
        .svg-zoom-wrapper {
          width: 100%;
          max-width: 100%;
        }
        .arch-svg-canvas {
          background: transparent;
          width: 100%;
          height: auto;
          display: block;
        }

        /* 5. Node Inspector */
        .arch-node-inspector-card {
          margin: 1.5rem 1.75rem;
          background: #ffffff;
          border: 1px solid #c45b3c;
          border-radius: 10px;
          padding: 1.5rem;
          box-shadow: 0 6px 20px rgba(196, 91, 60, 0.08);
          animation: slideDown 0.25s ease-out;
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .inspector-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.85rem;
        }
        .inspector-title-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .inspector-layer-pill {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: #fbf4ec;
          color: #c45b3c;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }
        .inspector-name {
          font-family: var(--font-fraunces), serif;
          font-size: 1.25rem;
          color: #2e2117;
          margin: 0;
          font-weight: 700;
        }
        .status-badge {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }
        .status-badge.live {
          background: #e2f0e9;
          color: #1e5c40;
        }
        .status-badge.beta {
          background: #fdf3e1;
          color: #8f5a0a;
        }
        .inspector-close-btn {
          background: none;
          border: 1px solid #ecdfd0;
          border-radius: 4px;
          padding: 0.25rem 0.65rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: #786b60;
          cursor: pointer;
        }
        .inspector-close-btn:hover {
          color: #c45b3c;
          border-color: #c45b3c;
        }
        .inspector-desc {
          font-size: 0.92rem;
          color: #5c4f43;
          line-height: 1.5;
          margin: 0 0 1.25rem 0;
        }
        .inspector-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        @media (max-width: 768px) {
          .inspector-grid {
            grid-template-columns: 1fr;
          }
        }
        .inspector-box {
          background: #fbf4ec;
          border: 1px solid #ecdfd0;
          border-radius: 8px;
          padding: 0.85rem 1rem;
        }
        .box-title {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #c45b3c;
          text-transform: uppercase;
          display: block;
          margin-bottom: 0.4rem;
        }
        .box-text {
          font-size: 0.85rem;
          color: #2e2117;
          margin: 0;
          line-height: 1.45;
        }
        .box-text.code-val {
          font-family: monospace;
          color: #243e56;
          font-weight: 600;
        }
        .box-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .box-list li {
          font-size: 0.82rem;
          color: #5c4f43;
          display: flex;
          gap: 0.4rem;
        }
        .box-list li::before {
          content: "•";
          color: #c45b3c;
        }
        .inspector-footer {
          border-top: 1px dashed #ecdfd0;
          padding-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .service-ref {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .ref-label {
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #786b60;
        }
        .ref-path {
          font-family: monospace;
          font-size: 0.82rem;
          color: #c45b3c;
          font-weight: 700;
          background: #fbf4ec;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
        }
        .snippet-wrap {
          border: 1px solid #ecdfd0;
          border-radius: 6px;
          overflow: hidden;
        }
        .snippet-bar {
          background: #2e2117;
          padding: 0.4rem 0.85rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .snippet-title {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #ecdfd0;
          text-transform: uppercase;
        }
        .snippet-copy-btn {
          background: rgba(255, 255, 255, 0.15);
          border: none;
          color: #ffffff;
          padding: 0.2rem 0.5rem;
          border-radius: 3px;
          font-size: 0.7rem;
          cursor: pointer;
        }
        .snippet-copy-btn:hover {
          background: #c45b3c;
        }
        .arch-code-block {
          background: #1a1a1a;
          color: #f5eedf;
          padding: 0.85rem 1rem;
          margin: 0;
          font-family: monospace;
          font-size: 0.8rem;
          line-height: 1.5;
          overflow-x: auto;
        }

        /* 6. Execution Timeline */
        .arch-timeline-container {
          padding: 1.75rem;
          background: #fffdf9;
          border-top: 1px solid #ecdfd0;
        }
        .timeline-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1.5rem;
          flex-wrap: wrap;
          margin-bottom: 1.75rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid #ecdfd0;
        }
        .timeline-section-title {
          font-family: var(--font-fraunces), serif;
          font-size: 1.3rem;
          color: #2e2117;
          margin: 0 0 0.35rem 0;
          font-weight: 700;
        }
        .timeline-section-sub {
          font-size: 0.88rem;
          color: #786b60;
          margin: 0;
        }
        .timeline-header-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .step-stepper {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          background: #fbf4ec;
          border: 1px solid #ecdfd0;
          border-radius: 6px;
          padding: 0.2rem 0.4rem;
        }
        .step-nav-btn {
          background: #ffffff;
          border: 1px solid #ecdfd0;
          padding: 0.25rem 0.6rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #2e2117;
          cursor: pointer;
        }
        .step-nav-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .step-stepper-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: #5c4f43;
          padding: 0 0.4rem;
        }
        .timeline-track {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .timeline-step-card {
          display: flex;
          gap: 1.25rem;
          background: #ffffff;
          border: 1px solid #ecdfd0;
          border-radius: 10px;
          padding: 1rem 1.4rem;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .timeline-step-card:hover {
          border-color: #c45b3c;
          box-shadow: 0 4px 14px rgba(196, 91, 60, 0.06);
          background: #fffdf9;
        }
        .timeline-step-card.active {
          border-color: #c45b3c;
          box-shadow: 0 4px 16px rgba(196, 91, 60, 0.12);
          background: #fffdf9;
        }
        .timeline-guide-rail {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 32px;
          flex-shrink: 0;
        }
        .timeline-dot {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: #ecdfd0;
          color: #5c4f43;
          font-size: 0.75rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .timeline-dot.active-dot {
          background: #c45b3c;
          color: #ffffff;
          box-shadow: 0 0 0 3px rgba(196, 91, 60, 0.2);
        }
        .timeline-line {
          width: 2px;
          flex-grow: 1;
          background: #ecdfd0;
          margin-top: 0.4rem;
        }
        .timeline-body-wrap {
          flex-grow: 1;
        }
        .timeline-step-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          user-select: none;
        }
        .step-tags-line {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.35rem;
          flex-wrap: wrap;
        }
        .step-stage-tag {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: rgba(196, 91, 60, 0.1);
          color: #c45b3c;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
        }
        .step-component-tag {
          font-size: 0.68rem;
          font-weight: 700;
          color: #243e56;
          background: #eef4fa;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
        }
        .step-module-tag {
          font-family: monospace;
          font-size: 0.72rem;
          color: #786b60;
        }
        .step-operation-title {
          font-family: var(--font-fraunces), serif;
          font-size: 1.08rem;
          color: #2e2117;
          margin: 0 0 0.35rem 0;
          font-weight: 700;
          line-height: 1.35;
        }
        .step-main-work {
          font-size: 0.85rem;
          color: #5c4f43;
          margin: 0 0 0.35rem 0;
          line-height: 1.45;
        }
        .main-work-label {
          font-weight: 700;
          color: #2e2117;
        }
        .step-guard-line {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #fbf4ec;
          border-left: 3px solid #1e5c40;
          padding: 0.35rem 0.65rem;
          border-radius: 0 4px 4px 0;
          margin-top: 0.3rem;
        }
        .guard-shield-badge {
          font-size: 0.68rem;
          font-weight: 800;
          color: #1e5c40;
          white-space: nowrap;
        }
        .guard-desc-text {
          font-size: 0.78rem;
          color: #4a3b32;
          line-height: 1.35;
        }
      `}</style>
    </div>
  );
}

// =========================================================================
// 🏛 SVG TOPOLOGY SUB-COMPONENTS (With Dynamic Flow Dashes & Interactive Nodes)
// =========================================================================

interface TopologyProps {
  nodes: ArchitectureNode[];
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  animateFlow: boolean;
  onSelectNode: (id: string) => void;
  onHoverNode: (id: string | null) => void;
}

// ── 1. BILINGUAL COPILOT CHAT TOPOLOGY (6 Nodes) ──
function ChatTopology({
  nodes,
  selectedNodeId,
  hoveredNodeId,
  animateFlow,
  onSelectNode,
  onHoverNode,
}: TopologyProps) {
  const nodeWidth = 142;
  const nodeHeight = 138;
  const startY = 38;
  const gap = 28;

  const positions = [
    { x: 20, y: startY },
    { x: 20 + (nodeWidth + gap), y: startY },
    { x: 20 + (nodeWidth + gap) * 2, y: startY },
    { x: 20 + (nodeWidth + gap) * 3, y: startY },
    { x: 20 + (nodeWidth + gap) * 4, y: startY },
    { x: 20 + (nodeWidth + gap) * 5, y: startY },
  ];

  return (
    <g>
      {/* Primary Connectors (Between consecutive nodes) */}
      {positions.slice(0, 5).map((pos, idx) => {
        const fromX = pos.x + nodeWidth;
        const toX = positions[idx + 1].x;
        const midY = startY + nodeHeight / 2;
        const labels = [
          "HTTPS / POST",
          "qa_graph.ainvoke",
          "hybrid_retriever",
          "Groq LLaMA 70B",
          "Gazette Verify",
        ];
        return (
          <g key={idx}>
            <path
              d={`M ${fromX} ${midY} L ${toX - 2} ${midY}`}
              stroke="#C45B3C"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arch-arrow)"
              strokeDasharray={animateFlow ? "6 3" : "none"}
              className={animateFlow ? "arch-flowing-path" : ""}
            />
            <text
              x={(fromX + toX) / 2}
              y={midY - 7}
              textAnchor="middle"
              fill="#C45B3C"
              fontSize="7.5"
              fontWeight="800"
            >
              {labels[idx]}
            </text>
          </g>
        );
      })}

      {/* Return Stream: Arc from Node 5 back to Node 0 */}
      <path
        d={`M ${positions[5].x + nodeWidth / 2} ${startY + nodeHeight} C ${
          positions[5].x + nodeWidth / 2
        } 220, ${positions[0].x + nodeWidth / 2} 220, ${positions[0].x + nodeWidth / 2} ${
          startY + nodeHeight + 8
        }`}
        stroke="#1E5C40"
        strokeWidth="2.2"
        strokeDasharray={animateFlow ? "6 4" : "none"}
        fill="none"
        markerEnd="url(#arch-return-arrow)"
        className={animateFlow ? "arch-return-flowing" : ""}
      />

      {/* Return Stream Badge in the Center */}
      <g transform="translate(200, 202)">
        <rect
          width="660"
          height="32"
          rx="6"
          fill="#FFFDF9"
          stroke="#1E5C40"
          strokeWidth="1.2"
          filter="drop-shadow(0 2px 6px rgba(30,92,64,0.08))"
        />
        <text x="330" y="15" textAnchor="middle" fill="#1E5C40" fontSize="9" fontWeight="800">
          RETURN STREAM: Verified Statutory Citations & Gazette Links via SSE Token Stream
        </text>
        <text x="330" y="26" textAnchor="middle" fill="#786B60" fontSize="7.8">
          100% Anti-Hallucination Grounding • Precedents from bdlaws.minlaw.gov.bd
        </text>
      </g>

      {/* Render 6 Nodes */}
      {nodes.map((node, idx) => {
        const pos = positions[idx] || { x: 0, y: 0 };
        const isSelected = selectedNodeId === node.id;
        const isHovered = hoveredNodeId === node.id;

        return (
          <SvgNodeCard
            key={node.id}
            node={node}
            x={pos.x}
            y={pos.y}
            width={nodeWidth}
            height={nodeHeight}
            isSelected={isSelected}
            isHovered={isHovered}
            accentColor={
              idx === 0 ? "#1E5C40" : idx === 1 ? "#C45B3C" : idx === 4 ? "#8F5A0A" : "#243E56"
            }
            onClick={() => onSelectNode(node.id)}
            onMouseEnter={() => onHoverNode(node.id)}
            onMouseLeave={() => onHoverNode(null)}
          />
        );
      })}
    </g>
  );
}

// ── 2. CONTRACT AUDIT PIPELINE TOPOLOGY (7 Nodes) ──
function ContractTopology({
  nodes,
  selectedNodeId,
  hoveredNodeId,
  animateFlow,
  onSelectNode,
  onHoverNode,
}: TopologyProps) {
  const nodeWidth = 124;
  const nodeHeight = 138;
  const startY = 38;
  const gap = 20;

  const positions = [
    { x: 20, y: startY },
    { x: 20 + (nodeWidth + gap), y: startY },
    { x: 20 + (nodeWidth + gap) * 2, y: startY },
    { x: 20 + (nodeWidth + gap) * 3, y: startY },
    { x: 20 + (nodeWidth + gap) * 4, y: startY },
    { x: 20 + (nodeWidth + gap) * 5, y: startY },
    { x: 20 + (nodeWidth + gap) * 6, y: startY },
  ];

  return (
    <g>
      {/* Primary Connectors (Between consecutive nodes) */}
      {positions.slice(0, 6).map((pos, idx) => {
        const fromX = pos.x + nodeWidth;
        const toX = positions[idx + 1].x;
        const midY = startY + nodeHeight / 2;
        const labels = [
          "Upload Stream",
          "AST Parsing",
          "Missing Checks",
          "LLaMA 70B Scorer",
          "Statutory Match",
          "DOCX Memo Stream",
        ];
        return (
          <g key={idx}>
            <path
              d={`M ${fromX} ${midY} L ${toX - 2} ${midY}`}
              stroke="#C45B3C"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arch-arrow)"
              strokeDasharray={animateFlow ? "6 3" : "none"}
              className={animateFlow ? "arch-flowing-path" : ""}
            />
            <text
              x={(fromX + toX) / 2}
              y={midY - 7}
              textAnchor="middle"
              fill="#C45B3C"
              fontSize="7"
              fontWeight="800"
            >
              {labels[idx]}
            </text>
          </g>
        );
      })}

      {/* Return Stream: Arc from Node 6 back to Node 0 */}
      <path
        d={`M ${positions[6].x + nodeWidth / 2} ${startY + nodeHeight} C ${
          positions[6].x + nodeWidth / 2
        } 220, ${positions[0].x + nodeWidth / 2} 220, ${positions[0].x + nodeWidth / 2} ${
          startY + nodeHeight + 8
        }`}
        stroke="#1E5C40"
        strokeWidth="2.2"
        strokeDasharray={animateFlow ? "6 4" : "none"}
        fill="none"
        markerEnd="url(#arch-return-arrow)"
        className={animateFlow ? "arch-return-flowing" : ""}
      />

      {/* Return Stream Badge */}
      <g transform="translate(190, 202)">
        <rect
          width="680"
          height="32"
          rx="6"
          fill="#FFFDF9"
          stroke="#1E5C40"
          strokeWidth="1.2"
          filter="drop-shadow(0 2px 6px rgba(30,92,64,0.08))"
        />
        <text x="340" y="15" textAnchor="middle" fill="#1E5C40" fontSize="9" fontWeight="800">
          RETURN STREAM: 30-Second Audit Memo · Severity Ranked Findings · DOCX Redlines
        </text>
        <text x="340" y="26" textAnchor="middle" fill="#786B60" fontSize="7.8">
          Executive Health Score (0-100) • Mandatory Statutory Compliance Validation
        </text>
      </g>

      {/* Render 7 Nodes */}
      {nodes.map((node, idx) => {
        const pos = positions[idx] || { x: 0, y: 0 };
        const isSelected = selectedNodeId === node.id;
        const isHovered = hoveredNodeId === node.id;

        return (
          <SvgNodeCard
            key={node.id}
            node={node}
            x={pos.x}
            y={pos.y}
            width={nodeWidth}
            height={nodeHeight}
            isSelected={isSelected}
            isHovered={isHovered}
            accentColor={
              idx === 0 ? "#1E5C40" : idx === 1 ? "#C45B3C" : idx === 4 ? "#8F5A0A" : "#243E56"
            }
            onClick={() => onSelectNode(node.id)}
            onMouseEnter={() => onHoverNode(node.id)}
            onMouseLeave={() => onHoverNode(null)}
          />
        );
      })}
    </g>
  );
}

// ── 3. LAWYER HITL SYSTEM TOPOLOGY (5 Nodes) ──
function LawyerTopology({
  nodes,
  selectedNodeId,
  hoveredNodeId,
  animateFlow,
  onSelectNode,
  onHoverNode,
}: TopologyProps) {
  const nodeWidth = 170;
  const nodeHeight = 138;
  const startY = 38;
  const gap = 32;

  const positions = [
    { x: 35, y: startY },
    { x: 35 + (nodeWidth + gap), y: startY },
    { x: 35 + (nodeWidth + gap) * 2, y: startY },
    { x: 35 + (nodeWidth + gap) * 3, y: startY },
    { x: 35 + (nodeWidth + gap) * 4, y: startY },
  ];

  return (
    <g>
      {/* Primary Connectors (Between consecutive nodes) */}
      {positions.slice(0, 4).map((pos, idx) => {
        const fromX = pos.x + nodeWidth;
        const toX = positions[idx + 1].x;
        const midY = startY + nodeHeight / 2;
        const labels = [
          "POST /inquiries",
          "rank_lawyers",
          "3-Hour Dispatch",
          "Bar Seal & Sign",
        ];
        return (
          <g key={idx}>
            <path
              d={`M ${fromX} ${midY} L ${toX - 2} ${midY}`}
              stroke="#C45B3C"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arch-arrow)"
              strokeDasharray={animateFlow ? "6 3" : "none"}
              className={animateFlow ? "arch-flowing-path" : ""}
            />
            <text
              x={(fromX + toX) / 2}
              y={midY - 7}
              textAnchor="middle"
              fill="#C45B3C"
              fontSize="7.5"
              fontWeight="800"
            >
              {labels[idx]}
            </text>
          </g>
        );
      })}

      {/* Return Stream: Arc from Node 4 back to Node 0 */}
      <path
        d={`M ${positions[4].x + nodeWidth / 2} ${startY + nodeHeight} C ${
          positions[4].x + nodeWidth / 2
        } 220, ${positions[0].x + nodeWidth / 2} 220, ${positions[0].x + nodeWidth / 2} ${
          startY + nodeHeight + 8
        }`}
        stroke="#1E5C40"
        strokeWidth="2.2"
        strokeDasharray={animateFlow ? "6 4" : "none"}
        fill="none"
        markerEnd="url(#arch-return-arrow)"
        className={animateFlow ? "arch-return-flowing" : ""}
      />

      {/* Return Stream Badge */}
      <g transform="translate(200, 202)">
        <rect
          width="660"
          height="32"
          rx="6"
          fill="#FFFDF9"
          stroke="#1E5C40"
          strokeWidth="1.2"
          filter="drop-shadow(0 2px 6px rgba(30,92,64,0.08))"
        />
        <text x="330" y="15" textAnchor="middle" fill="#1E5C40" fontSize="9" fontWeight="800">
          RETURN STREAM: Verified Countersigned Legal Memo & Official Bar Seal
        </text>
        <text x="330" y="26" textAnchor="middle" fill="#786B60" fontSize="7.8">
          Tamper-Proof Audit Trail • Instant Fee Disbursement to Advocate
        </text>
      </g>

      {/* Render 5 Nodes */}
      {nodes.map((node, idx) => {
        const pos = positions[idx] || { x: 0, y: 0 };
        const isSelected = selectedNodeId === node.id;
        const isHovered = hoveredNodeId === node.id;

        return (
          <SvgNodeCard
            key={node.id}
            node={node}
            x={pos.x}
            y={pos.y}
            width={nodeWidth}
            height={nodeHeight}
            isSelected={isSelected}
            isHovered={isHovered}
            accentColor={
              idx === 0 ? "#1E5C40" : idx === 1 ? "#C45B3C" : idx === 3 ? "#8F5A0A" : "#243E56"
            }
            onClick={() => onSelectNode(node.id)}
            onMouseEnter={() => onHoverNode(node.id)}
            onMouseLeave={() => onHoverNode(null)}
          />
        );
      })}
    </g>
  );
}

// ── 4. FASTMCP TOOLS & SEARCH TOPOLOGY (Hub & Spoke - 6 Nodes) ──
function McpTopology({
  nodes,
  selectedNodeId,
  hoveredNodeId,
  animateFlow,
  onSelectNode,
  onHoverNode,
}: TopologyProps) {
  const nodeWidth = 142;
  const nodeHeight = 138;
  const startY = 38;
  const gap = 28;

  const positions = [
    { x: 20, y: startY },
    { x: 20 + (nodeWidth + gap), y: startY },
    { x: 20 + (nodeWidth + gap) * 2, y: startY },
    { x: 20 + (nodeWidth + gap) * 3, y: startY },
    { x: 20 + (nodeWidth + gap) * 4, y: startY },
    { x: 20 + (nodeWidth + gap) * 5, y: startY },
  ];

  return (
    <g>
      {/* Primary Connectors (Between consecutive nodes) */}
      {positions.slice(0, 5).map((pos, idx) => {
        const fromX = pos.x + nodeWidth;
        const toX = positions[idx + 1].x;
        const midY = startY + nodeHeight / 2;
        const labels = [
          "JSON-RPC 2.0",
          "search_statutes",
          "check_act_status",
          "search_case_law",
          "Proxy-Safe POST",
        ];
        return (
          <g key={idx}>
            <path
              d={`M ${fromX} ${midY} L ${toX - 2} ${midY}`}
              stroke="#C45B3C"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arch-arrow)"
              strokeDasharray={animateFlow ? "6 3" : "none"}
              className={animateFlow ? "arch-flowing-path" : ""}
            />
            <text
              x={(fromX + toX) / 2}
              y={midY - 7}
              textAnchor="middle"
              fill="#C45B3C"
              fontSize="7.5"
              fontWeight="800"
            >
              {labels[idx]}
            </text>
          </g>
        );
      })}

      {/* Return Stream: Arc from Node 5 back to Node 0 */}
      <path
        d={`M ${positions[5].x + nodeWidth / 2} ${startY + nodeHeight} C ${
          positions[5].x + nodeWidth / 2
        } 220, ${positions[0].x + nodeWidth / 2} 220, ${positions[0].x + nodeWidth / 2} ${
          startY + nodeHeight + 8
        }`}
        stroke="#1E5C40"
        strokeWidth="2.2"
        strokeDasharray={animateFlow ? "6 4" : "none"}
        fill="none"
        markerEnd="url(#arch-return-arrow)"
        className={animateFlow ? "arch-return-flowing" : ""}
      />

      {/* Return Stream Banner */}
      <g transform="translate(200, 202)">
        <rect
          width="660"
          height="32"
          rx="6"
          fill="#FFFDF9"
          stroke="#1E5C40"
          strokeWidth="1.2"
          filter="drop-shadow(0 2px 6px rgba(30,92,64,0.08))"
        />
        <text x="330" y="15" textAnchor="middle" fill="#1E5C40" fontSize="9" fontWeight="800">
          RETURN STREAM: Proxy-Safe Inline JSON-RPC 2.0 Response · Sub-280ms Latency · Zero SSE Drops
        </text>
        <text x="330" y="26" textAnchor="middle" fill="#786B60" fontSize="7.8">
          8 Production Legal Tools • 2 Dynamic Resources (legal://) • 2 Research Prompt Templates
        </text>
      </g>

      {/* Render 6 Nodes */}
      {nodes.map((node, idx) => {
        const pos = positions[idx] || { x: 0, y: 0 };
        const isSelected = selectedNodeId === node.id;
        const isHovered = hoveredNodeId === node.id;

        return (
          <SvgNodeCard
            key={node.id}
            node={node}
            x={pos.x}
            y={pos.y}
            width={nodeWidth}
            height={nodeHeight}
            isSelected={isSelected}
            isHovered={isHovered}
            accentColor={
              idx === 0 ? "#1E5C40" : idx === 1 ? "#C45B3C" : idx === 3 ? "#8F5A0A" : idx === 4 ? "#1E5C40" : "#243E56"
            }
            onClick={() => onSelectNode(node.id)}
            onMouseEnter={() => onHoverNode(node.id)}
            onMouseLeave={() => onHoverNode(null)}
          />
        );
      })}
    </g>
  );
}

// ── CLEAN BULLET RETRIEVER HELPER ──
function getNodeBullets(node: ArchitectureNode): string[] {
  const map: Record<string, string[]> = {
    // Chat Flow
    chat_ui: ["Client Sovereign PII", "Live SSE Token Stream", "Zero Raw Transit"],
    chat_gateway: ["Token Version Auth Guard", "Atomic Credit Ledger", "BOLA Security Layer"],
    chat_router: ["Intent Classification", "StateGraph Machine", "Art. 33 Safeguards"],
    chat_retriever: ["3,547 Act Aliases", "Qdrant Hybrid Vectors", "Cosine Filter >= 0.78"],
    chat_generator: ["Groq LLaMA 3.3 70B", "Grounded Reasoning", "Context-Only Synthesis"],
    chat_verifier: ["Official Gazette Check", "BDlaws Authentic URLs", "Zero Hallucination"],

    // Contract Audit
    contract_upload: ["Client Sovereignty", "Zero Raw Ingestion", "SHA-256 Checksum"],
    contract_extract: ["PDF/DOCX AST Parsing", "Structural Hierarchy", "Table Matrix Parser"],
    contract_classify: ["Clause Classification", "Missing Terms Alert", "Standard Playbook"],
    contract_risk: ["LLaMA 70B Risk Scorer", "Severity Ranking", "Exposure Analysis"],
    contract_statute: ["Bangla Statute Match", "Section Verification", "Statutory Checks"],
    contract_grounding: ["Clause Pinpointer", "Citation Validation", "Confidence Scoring"],
    contract_export: ["Executive Audit Memo", "DOCX Redlines Stream", "Client PDF Delivery"],

    // Lawyer HITL
    lawyer_trigger: ["Risk Threshold Alert", "Client Escrow Deposit", "Instant Dispatch"],
    lawyer_matcher: ["Supreme Court Filter", "Specialty Routing", "3-Hour Timed Dispatch"],
    lawyer_portal: ["Secure Sandbox Portal", "Dual Redline View", "Client Messaging"],
    lawyer_sign: ["Digital Bar Seal", "Bangladesh Bar Sanction", "Signed Legal Memo"],
    lawyer_audit: ["Tamper-Proof Audit", "SSLCommerz Payout", "Completed Delivery"],

    // MCP Tools & Search (Updated directly from Bangladesh-Legal-MCP Server)
    mcp_client: ["Cursor IDE & Claude", "FastMCP Protocol Client", "Sub-second Tool Calls"],
    mcp_gateway: ["DNS Rebinding Shield", "Allowed Hosts Filter", "Stateless HTTP Transport"],
    mcp_statute: ["35K+ Sections (e5-small)", "Verbatim Section Scroll", "Act Table of Contents"],
    mcp_shield: ["[রহিত] Repeal Detector", "Replacement Chain Map", "0% Phantom Citations"],
    mcp_case_law: ["Supreme Court Verdicts", "10 Legal Topic Vectors", "Tier 1 Domain Filter"],
    mcp_delivery: ["Self-Contained POST Body", "Zero SSE Proxy Buffering", "Render-to-Render Safe"],
  };

  if (map[node.id]) return map[node.id];
  return [
    node.role.slice(0, 22),
    (node.inputs[0] || "Standard Input").slice(0, 22),
    (node.outputs[0] || "Verified Output").slice(0, 22),
  ];
}

// ── SVG NODE CARD COMPONENT ──
interface SvgNodeCardProps {
  node: ArchitectureNode;
  x: number;
  y: number;
  width: number;
  height: number;
  isSelected: boolean;
  isHovered: boolean;
  accentColor: string;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function SvgNodeCard({
  node,
  x,
  y,
  width,
  height,
  isSelected,
  isHovered,
  accentColor,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: SvgNodeCardProps) {
  const isHighlighted = isSelected || isHovered;
  const bullets = getNodeBullets(node);

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: "pointer", transition: "transform 0.15s ease" }}
      filter={isHighlighted ? "url(#nodeGlow)" : undefined}
    >
      {/* Background card */}
      <rect
        width={width}
        height={height}
        rx="8"
        fill="url(#nodeGrad)"
        stroke={isSelected ? "#C45B3C" : isHovered ? "#C45B3C" : "#ECDFD0"}
        strokeWidth={isSelected ? "2.5" : isHovered ? "2" : "1.5"}
      />

      {/* Top accent strip */}
      <rect x="0" y="0" width={width} height="4" rx="2" fill={accentColor} />

      {/* Layer tag */}
      <text
        x={width / 2}
        y="19"
        textAnchor="middle"
        fill={accentColor}
        fontSize="7.5"
        fontWeight="800"
        letterSpacing="0.08em"
      >
        {node.layer.toUpperCase()}
      </text>

      {/* Component Title */}
      <text
        x={width / 2}
        y="36"
        textAnchor="middle"
        fill="#2E2117"
        fontSize="11"
        fontWeight="700"
      >
        {node.label.length > 20 ? node.label.slice(0, 18) + "…" : node.label}
      </text>

      {/* Tech tag pill */}
      <g transform={`translate(${width / 2 - 45}, 43)`}>
        <rect width="90" height="15" rx="3" fill="#FBF4EC" stroke="#ECDFD0" strokeWidth="0.8" />
        <text x="45" y="10.5" textAnchor="middle" fill="#786B60" fontSize="7" fontWeight="700">
          {node.tech.length > 18 ? node.tech.slice(0, 16) + "…" : node.tech}
        </text>
      </g>

      <line x1="10" y1="64" x2={width - 10} y2="64" stroke="#F0E5D8" strokeWidth="1" />

      {/* 3 Clean Key Role Bullets */}
      {bullets.slice(0, 3).map((b, i) => (
        <g key={i} transform={`translate(10, ${77 + i * 16})`}>
          <circle cx="3" cy="-3" r="1.5" fill={accentColor} />
          <text x="8" y="0" fill="#4A3B32" fontSize="7.6" fontWeight="500">
            {b.length > 22 ? b.slice(0, 20) + "…" : b}
          </text>
        </g>
      ))}

      {/* Bottom status badge */}
      <g transform={`translate(10, ${height - 16})`}>
        <circle cx="4" cy="1" r="2.5" fill={isSelected ? "#C45B3C" : "#1E5C40"} />
        <text x="11" y="4" fill={isSelected ? "#C45B3C" : "#786B60"} fontSize="7" fontWeight="700">
          {isSelected ? "ACTIVE NODE ✓" : "VERIFIED & LIVE"}
        </text>
      </g>
    </g>
  );
}
