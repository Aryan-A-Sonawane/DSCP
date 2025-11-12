# Network Simulator - Web UI

A modern, interactive web-based network simulator with visual path-finding algorithms (Dijkstra & Bellman-Ford).

## Features

✨ **Core Functionality**
- Add/Remove computer nodes dynamically
- Create bidirectional routes with latency (ms)
- Visual network topology with circular layout
- Real-time network statistics (sent/received packets, edges)

🔍 **Path Finding Algorithms**
- **Dijkstra's Algorithm** - Optimal for non-negative weights
- **Bellman-Ford Algorithm** - Handles negative weights & detects cycles

📊 **Visualization**
- Interactive SVG graph showing all computers and routes
- Highlighted paths when shortest path is calculated
- Node statistics (sent/received packets)
- Edge weights displayed on connections

📦 **Data Transfer Simulation**
- Simulate packet transfers between nodes
- Track sent and received packets per computer

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Lightning fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components
- **Lucide React** - Modern icon library

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```powershell
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:5173/`

## Usage Guide

### 1. Add Computers
Click the "Add Computer" button to add nodes to your network. Each computer gets a unique ID (0, 1, 2, ...).

### 2. Create Routes
In the "Computers" tab:
- Enter source computer ID
- Enter destination computer ID
- Enter latency in milliseconds
- Click "Add Route"

Routes are bidirectional (undirected graph).

### 3. Find Shortest Path
In the "Operations" tab:
- Enter source computer ID
- Enter destination computer ID
- Select algorithm (Dijkstra or Bellman-Ford)
- Click "Find Path"

The shortest path will be highlighted on the graph, showing the total distance and path sequence.

### 4. Transfer Data
Simulate data transfers:
- Enter source and destination IDs
- Enter number of packets
- Click "Transfer Data"

Statistics will update showing sent/received packet counts.

### 5. Network Management
- **Remove Computer**: Enter ID and click the trash icon
- **Clear Network**: Reset the entire network

## Algorithm Comparison

| Feature | Dijkstra | Bellman-Ford |
|---------|----------|--------------|
| **Time Complexity** | O(V²) or O(E log V) | O(V·E) |
| **Negative Weights** | ❌ No | ✅ Yes |
| **Negative Cycles** | - | ✅ Detects |
| **Best For** | General shortest path | Graphs with negative edges |

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn components
│   │   └── NetworkGraph.tsx # SVG network visualization
│   ├── lib/
│   │   ├── networkSimulator.ts  # Core graph logic
│   │   └── utils.ts            # Utilities
│   ├── App.tsx              # Main application
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── dscp.c                   # Original C implementation
├── components.json          # shadcn configuration
├── tailwind.config.js       # Tailwind configuration
└── vite.config.ts          # Vite configuration
```

## Original C Implementation

This web UI is a port of the original C-based network simulator (`dscp.c`) which includes:
- Graph implementation using adjacency lists
- Dijkstra's and Bellman-Ford algorithms
- Multi-threaded data transfer simulation
- Command-line interface

The web version maintains the same core algorithms while adding:
- Visual graph representation
- Modern, responsive UI
- Real-time updates
- Interactive controls

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!
