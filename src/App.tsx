import { useState } from 'react';
import { NetworkSimulator, PathResult } from './lib/networkSimulator';
import { NetworkGraph } from './components/NetworkGraph';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Separator } from './components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Network, Plus, Trash2, GitBranch, Search, Send, RefreshCw } from 'lucide-react';

function App() {
  const [simulator] = useState(() => new NetworkSimulator());
  const [, forceUpdate] = useState({});
  const [pathResult, setPathResult] = useState<PathResult | null>(null);
  const [message, setMessage] = useState<string>('');

  // Form states
  const [removeNodeId, setRemoveNodeId] = useState('');
  const [routeFrom, setRouteFrom] = useState('');
  const [routeTo, setRouteTo] = useState('');
  const [routeWeight, setRouteWeight] = useState('');
  const [pathStart, setPathStart] = useState('');
  const [pathEnd, setPathEnd] = useState('');
  const [pathAlgorithm, setPathAlgorithm] = useState<'dijkstra' | 'bellman-ford'>('dijkstra');
  const [transferFrom, setTransferFrom] = useState('');
  const [transferTo, setTransferTo] = useState('');
  const [transferPackets, setTransferPackets] = useState('');

  const refresh = () => forceUpdate({});

  const handleAddComputer = () => {
    const id = simulator.addComputer();
    setMessage(`Computer ${id} added successfully!`);
    refresh();
  };

  const handleRemoveComputer = () => {
    const id = parseInt(removeNodeId);
    if (isNaN(id)) {
      setMessage('Please enter a valid computer ID');
      return;
    }
    if (simulator.removeComputer(id)) {
      setMessage(`Computer ${id} removed successfully!`);
      setRemoveNodeId('');
      setPathResult(null);
      refresh();
    } else {
      setMessage(`Failed to remove computer ${id}`);
    }
  };

  const handleAddRoute = () => {
    const from = parseInt(routeFrom);
    const to = parseInt(routeTo);
    const weight = parseInt(routeWeight);
    
    if (isNaN(from) || isNaN(to) || isNaN(weight)) {
      setMessage('Please enter valid values for all fields');
      return;
    }
    
    if (weight <= 0) {
      setMessage('Latency must be greater than 0');
      return;
    }
    
    if (simulator.addRoute(from, to, weight)) {
      setMessage(`Route added: ${from} ↔ ${to} (${weight}ms). Multiple routes between same nodes are allowed!`);
      setRouteFrom('');
      setRouteTo('');
      setRouteWeight('');
      refresh();
    } else {
      setMessage('Failed to add route. Check the computer IDs.');
    }
  };

  const handleRemoveRoute = (from: number, to: number, weight: number) => {
    if (simulator.removeRoute(from, to, weight)) {
      setMessage(`Route removed: ${from} ↔ ${to} (${weight}ms)`);
      refresh();
    } else {
      setMessage('Failed to remove route');
    }
  };

  const handleFindPath = () => {
    const start = parseInt(pathStart);
    const end = parseInt(pathEnd);
    
    if (isNaN(start) || isNaN(end)) {
      setMessage('Please enter valid source and destination');
      return;
    }

    const result = pathAlgorithm === 'dijkstra' 
      ? simulator.dijkstra(start, end)
      : simulator.bellmanFord(start, end);

    if (result) {
      setPathResult(result);
      setMessage(`Shortest path found using ${result.algorithm}: ${result.distance}ms`);
    } else {
      setPathResult(null);
      setMessage('No path found or negative cycle detected');
    }
  };

  const handleTransferData = () => {
    const from = parseInt(transferFrom);
    const to = parseInt(transferTo);
    const packets = parseInt(transferPackets);
    
    if (isNaN(from) || isNaN(to) || isNaN(packets)) {
      setMessage('Please enter valid values for all fields');
      return;
    }

    if (simulator.transferData(from, to, packets)) {
      setMessage(`Transferred ${packets} packets from ${from} to ${to}`);
      setTransferFrom('');
      setTransferTo('');
      setTransferPackets('');
      refresh();
    } else {
      setMessage('Failed to transfer data');
    }
  };

  const handleClearNetwork = () => {
    simulator.clearNetwork();
    setPathResult(null);
    setMessage('Network cleared!');
    refresh();
  };

  const nodes = simulator.getNodes();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Network className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Network Simulator</h1>
              <p className="text-slate-600">Dijkstra & Bellman-Ford Path Finding</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {nodes.length} Computers
          </Badge>
        </div>

        {/* Message Display */}
        {message && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <p className="text-sm text-blue-900">{message}</p>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Network Visualization */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Network Topology</CardTitle>
                <CardDescription>
                  Visual representation of computers and routes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {nodes.length > 0 ? (
                  <NetworkGraph 
                    nodes={nodes} 
                    highlightedPath={pathResult?.path || []} 
                  />
                ) : (
                  <div className="flex items-center justify-center h-[500px] border rounded-lg bg-slate-50">
                    <div className="text-center">
                      <Network className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">No computers in the network yet</p>
                      <p className="text-sm text-slate-400">Add a computer to get started</p>
                    </div>
                  </div>
                )}
                
                {/* Path Result Display */}
                {pathResult && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Shortest Path ({pathResult.algorithm})
                    </h3>
                    <div className="space-y-1">
                      <p className="text-sm text-blue-800">
                        <strong>Distance:</strong> {pathResult.distance}ms
                      </p>
                      <p className="text-sm text-blue-800">
                        <strong>Path:</strong> {pathResult.path.join(' → ')}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Controls</CardTitle>
                <CardDescription>Manage your network</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="computers" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="computers">Computers</TabsTrigger>
                    <TabsTrigger value="operations">Operations</TabsTrigger>
                  </TabsList>
                  
                  {/* Computers Tab */}
                  <TabsContent value="computers" className="space-y-4">
                    {/* Add Computer */}
                    <div>
                      <Button 
                        onClick={handleAddComputer} 
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Computer
                      </Button>
                    </div>

                    <Separator />

                    {/* Remove Computer */}
                    <div className="space-y-2">
                      <Label htmlFor="remove-node">Remove Computer</Label>
                      <div className="flex gap-2">
                        <Input
                          id="remove-node"
                          type="number"
                          placeholder="Computer ID"
                          value={removeNodeId}
                          onChange={(e) => setRemoveNodeId(e.target.value)}
                        />
                        <Button 
                          onClick={handleRemoveComputer}
                          variant="destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Add Route */}
                    <div className="space-y-2">
                      <div>
                        <Label>Add Route</Label>
                        <p className="text-xs text-slate-500 mt-1">
                          Multiple routes allowed between nodes. Algorithm picks the best!
                        </p>
                      </div>
                      <Input
                        type="number"
                        placeholder="From (Computer ID)"
                        value={routeFrom}
                        onChange={(e) => setRouteFrom(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="To (Computer ID)"
                        value={routeTo}
                        onChange={(e) => setRouteTo(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Latency (ms)"
                        value={routeWeight}
                        onChange={(e) => setRouteWeight(e.target.value)}
                      />
                      <Button onClick={handleAddRoute} className="w-full">
                        <GitBranch className="w-4 h-4 mr-2" />
                        Add Route
                      </Button>
                    </div>

                    <Separator />

                    {/* Clear Network */}
                    <Button 
                      onClick={handleClearNetwork} 
                      variant="outline"
                      className="w-full"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Clear Network
                    </Button>
                  </TabsContent>

                  {/* Operations Tab */}
                  <TabsContent value="operations" className="space-y-4">
                    {/* Find Path */}
                    <div className="space-y-2">
                      <Label>Find Shortest Path</Label>
                      <Input
                        type="number"
                        placeholder="Source (Computer ID)"
                        value={pathStart}
                        onChange={(e) => setPathStart(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Destination (Computer ID)"
                        value={pathEnd}
                        onChange={(e) => setPathEnd(e.target.value)}
                      />
                      <Select 
                        value={pathAlgorithm} 
                        onValueChange={(value: 'dijkstra' | 'bellman-ford') => setPathAlgorithm(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dijkstra">Dijkstra's Algorithm</SelectItem>
                          <SelectItem value="bellman-ford">Bellman-Ford Algorithm</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleFindPath} className="w-full">
                        <Search className="w-4 h-4 mr-2" />
                        Find Path
                      </Button>
                    </div>

                    <Separator />

                    {/* Transfer Data */}
                    <div className="space-y-2">
                      <Label>Transfer Data</Label>
                      <Input
                        type="number"
                        placeholder="From (Computer ID)"
                        value={transferFrom}
                        onChange={(e) => setTransferFrom(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="To (Computer ID)"
                        value={transferTo}
                        onChange={(e) => setTransferTo(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Packets"
                        value={transferPackets}
                        onChange={(e) => setTransferPackets(e.target.value)}
                      />
                      <Button onClick={handleTransferData} className="w-full">
                        <Send className="w-4 h-4 mr-2" />
                        Transfer Data
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Statistics */}
            {nodes.length > 0 && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Network Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {nodes.map((node) => (
                        <div key={node.id} className="flex justify-between items-center text-sm">
                          <span className="font-medium">Computer {node.id}</span>
                          <div className="flex gap-3 text-xs text-slate-600">
                            <span>S: {node.sentPackets}</span>
                            <span>R: {node.receivedPackets}</span>
                            <span>E: {node.edges.length}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* All Routes */}
                <Card>
                  <CardHeader>
                    <CardTitle>All Routes</CardTitle>
                    <CardDescription>
                      {nodes.reduce((sum, n) => sum + n.edges.length, 0) / 2} route(s) total
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {nodes.map((node) =>
                        node.edges
                          .filter(edge => node.id < edge.destination) // Only show once per pair
                          .map((edge, idx) => (
                            <div
                              key={`route-${node.id}-${edge.destination}-${idx}`}
                              className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded hover:bg-slate-100 transition-colors"
                            >
                              <span className="font-medium">
                                {node.id} ↔ {edge.destination}
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="text-xs">
                                  {edge.weight}ms
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveRoute(node.id, edge.destination, edge.weight)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))
                      )}
                      {nodes.every(n => n.edges.length === 0) && (
                        <p className="text-sm text-slate-500 text-center py-4">
                          No routes yet. Add routes to connect computers.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
