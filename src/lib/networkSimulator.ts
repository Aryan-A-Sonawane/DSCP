export interface Edge {
  destination: number;
  weight: number;
}

export interface NetworkNode {
  id: number;
  edges: Edge[];
  sentPackets: number;
  receivedPackets: number;
}

export interface PathResult {
  distance: number;
  path: number[];
  edges: Array<{ from: number; to: number; weight: number }>; // Specific edges used
  algorithm: 'dijkstra' | 'bellman-ford';
}

export class NetworkSimulator {
  private nodes: NetworkNode[] = [];

  addComputer(): number {
    const id = this.nodes.length;
    this.nodes.push({
      id,
      edges: [],
      sentPackets: 0,
      receivedPackets: 0,
    });
    return id;
  }

  removeComputer(id: number): boolean {
    if (id < 0 || id >= this.nodes.length) return false;
    
    // Remove all edges pointing to this node
    this.nodes.forEach(node => {
      node.edges = node.edges.filter(edge => edge.destination !== id);
    });
    
    // Remove the node itself
    this.nodes.splice(id, 1);
    
    // Update all node IDs and edge references
    this.nodes.forEach((node, index) => {
      node.id = index;
      node.edges.forEach(edge => {
        if (edge.destination > id) {
          edge.destination--;
        }
      });
    });
    
    return true;
  }

  addRoute(from: number, to: number, weight: number): boolean {
    if (from < 0 || from >= this.nodes.length || 
        to < 0 || to >= this.nodes.length || 
        from === to || weight <= 0) {
      return false;
    }

    // Allow multiple edges between same nodes - algorithm will choose the best
    // Add forward edge
    this.nodes[from].edges.push({ destination: to, weight });

    // Add reverse edge (undirected graph)
    this.nodes[to].edges.push({ destination: from, weight });

    return true;
  }

  removeRoute(from: number, to: number, weight: number): boolean {
    if (from < 0 || from >= this.nodes.length || 
        to < 0 || to >= this.nodes.length) {
      return false;
    }

    // Remove the specific edge with matching weight
    const fromIndex = this.nodes[from].edges.findIndex(
      e => e.destination === to && e.weight === weight
    );
    if (fromIndex !== -1) {
      this.nodes[from].edges.splice(fromIndex, 1);
    }

    // Remove reverse edge
    const toIndex = this.nodes[to].edges.findIndex(
      e => e.destination === from && e.weight === weight
    );
    if (toIndex !== -1) {
      this.nodes[to].edges.splice(toIndex, 1);
    }

    return fromIndex !== -1 || toIndex !== -1;
  }

  dijkstra(start: number, end: number): PathResult | null {
    const n = this.nodes.length;
    if (start < 0 || start >= n || end < 0 || end >= n) return null;

    const distance: number[] = new Array(n).fill(Infinity);
    const previous: number[] = new Array(n).fill(-1);
    const edgeUsed: Array<{ from: number; to: number; weight: number } | null> = new Array(n).fill(null);
    const visited: boolean[] = new Array(n).fill(false);
    
    distance[start] = 0;

    for (let count = 0; count < n - 1; count++) {
      let minDist = Infinity;
      let minIndex = -1;

      for (let v = 0; v < n; v++) {
        if (!visited[v] && distance[v] <= minDist) {
          minDist = distance[v];
          minIndex = v;
        }
      }

      if (minIndex === -1) break;
      visited[minIndex] = true;

      this.nodes[minIndex].edges.forEach(edge => {
        const v = edge.destination;
        if (!visited[v] && distance[minIndex] + edge.weight < distance[v]) {
          distance[v] = distance[minIndex] + edge.weight;
          previous[v] = minIndex;
          edgeUsed[v] = { from: minIndex, to: v, weight: edge.weight };
        }
      });
    }

    if (distance[end] === Infinity) return null;

    // Reconstruct path and edges
    const path: number[] = [];
    const edges: Array<{ from: number; to: number; weight: number }> = [];
    let current = end;
    
    while (current !== -1) {
      path.unshift(current);
      if (edgeUsed[current]) {
        edges.unshift(edgeUsed[current]!);
      }
      current = previous[current];
    }

    return {
      distance: distance[end],
      path,
      edges,
      algorithm: 'dijkstra',
    };
  }

  bellmanFord(start: number, end: number): PathResult | null {
    const n = this.nodes.length;
    if (start < 0 || start >= n || end < 0 || end >= n) return null;

    const distance: number[] = new Array(n).fill(Infinity);
    const previous: number[] = new Array(n).fill(-1);
    const edgeUsed: Array<{ from: number; to: number; weight: number } | null> = new Array(n).fill(null);
    
    distance[start] = 0;

    // Relax edges repeatedly
    for (let iter = 0; iter < n - 1; iter++) {
      let updated = false;
      
      for (let u = 0; u < n; u++) {
        if (distance[u] === Infinity) continue;
        
        this.nodes[u].edges.forEach(edge => {
          const v = edge.destination;
          const w = edge.weight;
          
          if (distance[u] + w < distance[v]) {
            distance[v] = distance[u] + w;
            previous[v] = u;
            edgeUsed[v] = { from: u, to: v, weight: w };
            updated = true;
          }
        });
      }
      
      if (!updated) break;
    }

    // Check for negative weight cycles
    for (let u = 0; u < n; u++) {
      if (distance[u] === Infinity) continue;
      
      for (const edge of this.nodes[u].edges) {
        const v = edge.destination;
        const w = edge.weight;
        
        if (distance[u] + w < distance[v]) {
          console.warn('Negative weight cycle detected');
          return null;
        }
      }
    }

    if (distance[end] === Infinity) return null;

    // Reconstruct path and edges
    const path: number[] = [];
    const edges: Array<{ from: number; to: number; weight: number }> = [];
    let current = end;
    
    while (current !== -1) {
      path.unshift(current);
      if (edgeUsed[current]) {
        edges.unshift(edgeUsed[current]!);
      }
      current = previous[current];
    }

    return {
      distance: distance[end],
      path,
      edges,
      algorithm: 'bellman-ford',
    };
  }

  transferData(from: number, to: number, packets: number): boolean {
    if (from < 0 || from >= this.nodes.length || 
        to < 0 || to >= this.nodes.length) {
      return false;
    }

    this.nodes[from].sentPackets += packets;
    this.nodes[to].receivedPackets += packets;
    return true;
  }

  getNodes(): NetworkNode[] {
    return this.nodes;
  }

  clearNetwork(): void {
    this.nodes = [];
  }

  getNodeCount(): number {
    return this.nodes.length;
  }
}
