import React from 'react';
import { NetworkNode, Edge } from '../lib/networkSimulator';

interface NetworkGraphProps {
  nodes: NetworkNode[];
  highlightedPath?: number[];
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ nodes, highlightedPath = [] }) => {
  const width = 800;
  const height = 500;
  const radius = 30;

  // Position nodes in a circular layout
  const positions = nodes.map((_, index) => {
    const angle = (2 * Math.PI * index) / nodes.length - Math.PI / 2;
    const x = width / 2 + (width / 3) * Math.cos(angle);
    const y = height / 2 + (height / 3) * Math.sin(angle);
    return { x, y };
  });

  const isEdgeHighlighted = (from: number, to: number): boolean => {
    if (highlightedPath.length < 2) return false;
    for (let i = 0; i < highlightedPath.length - 1; i++) {
      if (
        (highlightedPath[i] === from && highlightedPath[i + 1] === to) ||
        (highlightedPath[i] === to && highlightedPath[i + 1] === from)
      ) {
        return true;
      }
    }
    return false;
  };

  // Collect all unique edges (group by node pair)
  const edgeGroups: Map<string, Edge[]> = new Map();
  nodes.forEach((node, fromIdx) => {
    node.edges.forEach((edge) => {
      // Create a key that's consistent regardless of direction
      const key = fromIdx < edge.destination 
        ? `${fromIdx}-${edge.destination}` 
        : `${edge.destination}-${fromIdx}`;
      
      if (!edgeGroups.has(key)) {
        edgeGroups.set(key, []);
      }
      // Only add if we haven't seen this exact edge from the lower index
      if (fromIdx < edge.destination) {
        edgeGroups.get(key)!.push(edge);
      }
    });
  });

  return (
    <div className="border rounded-lg p-4 bg-white">
      <svg width={width} height={height} className="mx-auto">
        {/* Draw edges */}
        {Array.from(edgeGroups.entries()).map(([key, edges]) => {
          const [fromStr, toStr] = key.split('-');
          const fromIdx = parseInt(fromStr);
          const toIdx = parseInt(toStr);
          const from = positions[fromIdx];
          const to = positions[toIdx];
          const highlighted = isEdgeHighlighted(fromIdx, toIdx);

          // If multiple edges, curve them slightly
          return edges.map((edge, idx) => {
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            
            // Calculate offset for multiple edges
            const totalEdges = edges.length;
            const offset = totalEdges > 1 ? (idx - (totalEdges - 1) / 2) * 20 : 0;
            
            // Perpendicular offset for curved lines
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const perpX = -dy / len * offset;
            const perpY = dx / len * offset;

            const controlX = midX + perpX;
            const controlY = midY + perpY;

            // Use quadratic curve for multiple edges
            const pathD = totalEdges > 1
              ? `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`
              : `M ${from.x} ${from.y} L ${to.x} ${to.y}`;

            return (
              <g key={`edge-${key}-${idx}`}>
                <path
                  d={pathD}
                  stroke={highlighted ? '#3b82f6' : '#94a3b8'}
                  strokeWidth={highlighted ? 3 : 2}
                  fill="none"
                  className="transition-all"
                />
                <text
                  x={controlX || midX}
                  y={(controlY || midY) - 5}
                  fill="#64748b"
                  fontSize="11"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  {edge.weight}ms
                </text>
              </g>
            );
          });
        })}

        {/* Draw nodes */}
        {nodes.map((node, index) => {
          const pos = positions[index];
          const isHighlighted = highlightedPath.includes(index);

          return (
            <g key={`node-${index}`}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={radius}
                fill={isHighlighted ? '#3b82f6' : '#f1f5f9'}
                stroke={isHighlighted ? '#1e40af' : '#64748b'}
                strokeWidth={isHighlighted ? 3 : 2}
                className="transition-all"
              />
              <text
                x={pos.x}
                y={pos.y - 5}
                textAnchor="middle"
                fill="#1e293b"
                fontSize="16"
                fontWeight="bold"
              >
                {index}
              </text>
              <text
                x={pos.x}
                y={pos.y + 10}
                textAnchor="middle"
                fill="#64748b"
                fontSize="10"
              >
                S:{node.sentPackets} R:{node.receivedPackets}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
