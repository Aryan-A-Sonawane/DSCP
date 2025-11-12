import React from 'react';
import { NetworkNode, Edge } from '../lib/networkSimulator';

interface NetworkGraphProps {
  nodes: NetworkNode[];
  highlightedEdges?: Array<{ from: number; to: number; weight: number }>;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ nodes, highlightedEdges = [] }) => {
  const width = 800;
  const height = 500;
  const radius = 30;

  const positions = nodes.map((_, index) => {
    const angle = (2 * Math.PI * index) / nodes.length - Math.PI / 2;
    const x = width / 2 + (width / 3) * Math.cos(angle);
    const y = height / 2 + (height / 3) * Math.sin(angle);
    return { x, y };
  });

  const isEdgeHighlighted = (from: number, to: number, weight: number): boolean => {
    return highlightedEdges.some(
      edge => 
        ((edge.from === from && edge.to === to) || 
         (edge.from === to && edge.to === from)) &&
        edge.weight === weight
    );
  };

  const isNodeHighlighted = (nodeId: number): boolean => {
    return highlightedEdges.some(
      edge => edge.from === nodeId || edge.to === nodeId
    );
  };

  const edgeGroups: Map<string, Edge[]> = new Map();
  nodes.forEach((node, fromIdx) => {
    node.edges.forEach((edge) => {
      const key = fromIdx < edge.destination 
        ? `${fromIdx}-${edge.destination}` 
        : `${edge.destination}-${fromIdx}`;
      
      if (!edgeGroups.has(key)) {
        edgeGroups.set(key, []);
      }
      if (fromIdx < edge.destination) {
        edgeGroups.get(key)!.push(edge);
      }
    });
  });

  return (
    <div className="border rounded-lg p-4 bg-white">
      <svg width={width} height={height} className="mx-auto">
        {Array.from(edgeGroups.entries()).map(([key, edges]) => {
          const [fromStr, toStr] = key.split('-');
          const fromIdx = parseInt(fromStr);
          const toIdx = parseInt(toStr);
          const from = positions[fromIdx];
          const to = positions[toIdx];

          return edges.map((edge, idx) => {
            const highlighted = isEdgeHighlighted(fromIdx, toIdx, edge.weight);
            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            
            const totalEdges = edges.length;
            const offset = totalEdges > 1 ? (idx - (totalEdges - 1) / 2) * 20 : 0;
            
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const perpX = -dy / len * offset;
            const perpY = dx / len * offset;

            const controlX = midX + perpX;
            const controlY = midY + perpY;

            const pathD = totalEdges > 1
              ? `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`
              : `M ${from.x} ${from.y} L ${to.x} ${to.y}`;

            return (
              <g key={`edge-${key}-${idx}-${edge.weight}`}>
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
                  fill={highlighted ? '#1e40af' : '#64748b'}
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

        {nodes.map((node, index) => {
          const pos = positions[index];
          const highlighted = isNodeHighlighted(index);

          return (
            <g key={`node-${index}`}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={radius}
                fill={highlighted ? '#3b82f6' : '#f1f5f9'}
                stroke={highlighted ? '#1e40af' : '#64748b'}
                strokeWidth={highlighted ? 3 : 2}
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
