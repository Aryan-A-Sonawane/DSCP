# 🖧 Network Simulator<h1>🖧 Computer Network Simulation</h1> <br>



A powerful network topology simulator with interactive web UI and command-line implementations. Features visual graph representation, dual shortest path algorithms (Dijkstra & Bellman-Ford), and advanced route management.<h2>A C-based simulation of a computer network using graphs, demonstrating concepts from data structures such as adjacency lists, Dijkstra's algorithm, and multithreading for simulating data transfer.</h2> <br>

<h3>Current Implementation </h3> <br>

![Network Simulator](https://img.shields.io/badge/version-2.0.0-blue.svg)Implemented a dynamic computer network simulation with route management, shortest path computation using Dijkstra’s algorithm, data transfer simulation using multithreading, and live network statistics. <br>

![License](https://img.shields.io/badge/license-MIT-green.svg)

<h3>Features</h3> <br>

## 🌟 Features1. Add or remove computers (nodes) from the network. <br>

2. Connect computers via routes (edges) with custom latency (weights).  <br>

### Web Application (React + TypeScript)3. View the full network with connection details and packet statistics. <br>

- 🎨 **Interactive Visual Graph**: Real-time SVG-based network topology with circular node layout4. Find the shortest path between two computers using Dijkstra’s algorithm. <br>

- 🔄 **Dual Algorithm Support**: Choose between Dijkstra's and Bellman-Ford algorithms5. Simulate data transfer between two nodes with progress output using POSIX threads. <br>

- 🛣️ **Multiple Routes**: Add multiple paths between same nodes - algorithm picks the best!6. Track sent and received packets for each computer. <br>

- 📊 **Live Statistics**: Track sent/received packets and network metrics per node7. Reset/clear the entire network. <br>

- 🎯 **Path Highlighting**: Shortest paths highlighted in blue on the graph

- 🗑️ **Route Management**: View and delete individual routes in a dedicated panel<h3>Technologies Used</h3><br>

- 📈 **Curved Edge Display**: Multiple routes between nodes shown as curved linesC language <br>

- ⚠️ **Negative Cycle Detection**: Bellman-Ford warns about negative weight cyclesPOSIX Threads (pthreads) <br>

- 🎭 **Modern UI**: Built with shadcn/ui and Tailwind CSSWindows-specific Sleep function for progress simulation <br>

Adjacency list representation for graphs <b4>

### C Implementation (Legacy CLI)

- ✅ Dynamic computer network with adjacency list representation<h3>Operations Menu</h3> <br>

- ✅ Dijkstra's and Bellman-Ford shortest path algorithms1. Add Computer <br>

- ✅ Multithreaded data transfer simulation (POSIX threads)2. Remove Computer <br>

- ✅ Network statistics and packet tracking3. Add Route <br>

- ✅ Route management with custom latencies4. Show Network <br>

5. Find Shortest Path <br>

## 🚀 Quick Start6. Transfer Data <br>

7. Clear Network <br>

### Web Application8. Exit <br>



```bash

# Clone the repository

git clone https://github.com/Aryan-A-Sonawane/DSCP.git

cd DSCP



# Install dependencies

npm install

# Start development server
npm run dev
```

Open your browser to the URL shown (typically `http://localhost:5173`)

### C Application

```bash
# Compile (Windows with MinGW)
gcc dscp.c -o dscp.exe -lpthread

# Run
./dscp.exe
```

## 📖 Usage Guide

### Web UI

#### Adding Computers
1. Click **"Add Computer"** button
2. Computers get sequential IDs (0, 1, 2, ...)

#### Creating Routes
1. Go to **Computers** tab in Controls
2. Enter source ID, destination ID, and latency (ms)
3. Click **"Add Route"**
4. 💡 **Tip**: Add multiple routes between same nodes - the algorithm chooses optimally!

#### Finding Shortest Path
1. Switch to **Operations** tab
2. Enter source and destination IDs
3. Select algorithm:
   - **Dijkstra**: Fast, for non-negative weights
   - **Bellman-Ford**: Detects negative cycles
4. Click **"Find Path"**
5. Path highlights in blue!

#### Managing Routes
- View all routes in **"All Routes"** panel
- See total route count
- Delete specific routes with trash icon
- Multiple routes clearly visible

## 🎯 Example Scenarios

### Scenario 1: Basic Network
```
Add computers: 0, 1, 2
Add routes:
  - 0 ↔ 1: 50ms
  - 1 ↔ 2: 30ms
  - 0 ↔ 2: 100ms
Find path 0 → 2:
Result: 0 → 1 → 2 (80ms) ✅
```

### Scenario 2: Multiple Routes
```
Add computers: 0, 1, 2
Add routes:
  - 0 ↔ 2: 100ms (route 1)
  - 0 ↔ 2: 80ms  (route 2)
  - 0 ↔ 2: 60ms  (route 3)
Find path 0 → 2:
Result: 0 → 2 (60ms) - best route chosen! ✅
```

### Scenario 3: Equal Cost Paths
```
Add routes:
  - 0 ↔ 1: 50ms
  - 1 ↔ 2: 20ms
  - 0 ↔ 2: 70ms (direct)
Find path 0 → 2:
Result: Either path (both 70ms) - algorithm picks first discovered
```

## 🧮 Algorithms

### Dijkstra's Algorithm
- **Complexity**: O(V²)
- **Best for**: Non-negative weights
- **Strategy**: Greedy - always picks minimum distance node

### Bellman-Ford Algorithm
- **Complexity**: O(V×E)
- **Best for**: Negative weights, cycle detection
- **Strategy**: Relaxes all edges V-1 times

### Multiple Routes Handling
- Both algorithms consider **all available routes**
- Automatically selects minimum total cost
- Equal cost paths → returns first discovered

## 🛠️ Tech Stack

### Web Application
- **Frontend**: React 18 + TypeScript
- **Build**: Vite
- **UI**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Visualization**: Dynamic SVG rendering

### C Application
- **Language**: C
- **Threading**: POSIX threads (pthreads)
- **Data Structure**: Adjacency list (dynamic graph)
- **Platform**: Windows/Linux

## 📂 Project Structure

```
DSCP/
├── src/                          # Web application source
│   ├── components/
│   │   ├── ui/                   # shadcn UI components
│   │   └── NetworkGraph.tsx      # Network visualization
│   ├── lib/
│   │   ├── networkSimulator.ts   # Core simulation logic
│   │   └── utils.ts
│   ├── App.tsx                   # Main React component
│   └── main.tsx
├── dscp.c                        # C implementation
├── components.json               # shadcn config
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

## 🔧 Development

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Development Tips
- Hot reload enabled
- TypeScript for type safety
- ESLint configured
- Component-based architecture

## 🐛 Known Behaviors

- **Equal Cost Paths**: Algorithm returns first discovered path when multiple paths have equal cost
- **Node Removal**: Renumbers all subsequent nodes (IDs shift down)
- **Graph Layout**: Circular layout works best with 3-15 nodes
- **C Implementation**: Requires pthreads library (MinGW-w64 on Windows)

## 📝 C Implementation Features

```
Operations Menu:
1. Add Computer
2. Remove Computer
3. Add Route
4. Show Network
5. Find Shortest Path (Dijkstra & Bellman-Ford)
6. Transfer Data (with threading)
7. Clear Network
8. Exit
```

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👨‍💻 Author

**Aryan A Sonawane**
- GitHub: [@Aryan-A-Sonawane](https://github.com/Aryan-A-Sonawane)
- Repository: [DSCP](https://github.com/Aryan-A-Sonawane/DSCP)

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Lucide](https://lucide.dev/) - Icon library
- [Radix UI](https://www.radix-ui.com/) - Primitive components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

---

**Two Implementations, One Goal**: Master network algorithms through both modern web interfaces and classic C programming! 🚀
