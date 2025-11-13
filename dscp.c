#include <stdio.h>
#include <limits.h>
#include <stdbool.h>
#include <stdlib.h>
#include <pthread.h>
#include <unistd.h>
#include <windows.h>

#define MAX_NODES 100

typedef struct Edge {
    int destination;
    int weight;
    struct Edge* next;
} Edge;

// Adjacency list for the network
Edge* graph[MAX_NODES];
int sent_packets[MAX_NODES] = {0};
int received_packets[MAX_NODES] = {0};
int nodes = 0;

void initialize_graph() {
    for (int i = 0; i < MAX_NODES; i++) {
        graph[i] = NULL;
    }
}

void add_computer() {
    if (nodes < MAX_NODES) {
        nodes++;
        printf("Computer %d added to the network.\n", nodes - 1);
    } else {
        printf("Network limit reached!\n");
    }
}

void remove_computer(int comp) {
    if (comp >= 0 && comp < nodes) {
        for (int i = comp; i < nodes - 1; i++) {
            graph[i] = graph[i + 1];
            sent_packets[i] = sent_packets[i + 1];
            received_packets[i] = received_packets[i + 1];
        }
        nodes--;
        printf("Computer %d removed from the network.\n", comp);
    } else {
        printf("Invalid computer index!\n");
    }
}

void add_route(int u, int v, int weight) {
    if (u < nodes && v < nodes && u != v) {
        // Add only forward edge (directed graph)
        Edge* newEdge = (Edge*)malloc(sizeof(Edge));
        newEdge->destination = v;
        newEdge->weight = weight;
        newEdge->next = graph[u];
        graph[u] = newEdge;

        printf("Route added: %d -> %d with latency %dms.\n", u, v, weight);
    } else {
        printf("Invalid computers!\n");
    }
}

void display_network() {
    printf("\nCurrent Network:\n");
    for (int i = 0; i < nodes; i++) {
        printf("Computer %d -> ", i);
        Edge* temp = graph[i];
        while (temp) {
            printf("%d(%dms) ", temp->destination, temp->weight);
            temp = temp->next;
        }
        printf("| Sent: %d | Received: %d\n", sent_packets[i], received_packets[i]);
    }
}

bool has_negative_weights() {
    for (int i = 0; i < nodes; i++) {
        Edge* temp = graph[i];
        while (temp) {
            if (temp->weight < 0) {
                return true;
            }
            temp = temp->next;
        }
    }
    return false;
}

void dijkstra(int start, int end) {
    // Dijkstra's algorithm cannot handle negative weights at all
    if (has_negative_weights()) {
        printf("\n⚠️  ALGORITHM ERROR\n");
        printf("=====================================\n");
        printf("Dijkstra's algorithm cannot be used with negative edge weights.\n");
        printf("Please use Bellman-Ford algorithm instead.\n");
        printf("=====================================\n");
        return;
    }

    int distance[MAX_NODES];
    int previous[MAX_NODES];
    bool visited[MAX_NODES];
    
    for (int i = 0; i < nodes; i++) {
        distance[i] = INT_MAX;
        previous[i] = -1;
        visited[i] = false;
    }
    distance[start] = 0;
    
    for (int count = 0; count < nodes - 1; count++) {
        int min = INT_MAX, minIndex = -1;
        for (int v = 0; v < nodes; v++) {
            if (!visited[v] && distance[v] <= min) {
                min = distance[v];
                minIndex = v;
            }
        }
        if (minIndex == -1) break;
        visited[minIndex] = true;

        Edge* temp = graph[minIndex];
        while (temp) {
            if (!visited[temp->destination] && distance[minIndex] + temp->weight < distance[temp->destination]) {
                distance[temp->destination] = distance[minIndex] + temp->weight;
                previous[temp->destination] = minIndex;
            }
            temp = temp->next;
        }
    }

    printf("\nShortest path from %d to %d: %dms\n", start, end, distance[end]);
    printf("Path: ");
    int current = end;
    while (current != -1) {
        printf("%d <- ", current);
        current = previous[current];
    }
    printf("END\n");
}

void* data_transfer(void* arg) {
    int* params = (int*)arg;
    int from = params[0];
    int to = params[1];
    int packets = params[2];
    sent_packets[from] += packets;
    received_packets[to] += packets;
    for (int i = 0; i <= 100; i += 10) {
        printf("Data transfer: %d%%\n", i);
        Sleep(5 * packets);  // Sleep takes milliseconds
    }
    printf("Data transfer complete: %d packets sent from %d to %d.\n", packets, from, to);
    return NULL;
}

void clear_network() {
    initialize_graph();
    nodes = 0;
    for (int i = 0; i < MAX_NODES; i++) {
        sent_packets[i] = 0;
        received_packets[i] = 0;
    }
    printf("Network cleared!\n");
}

int main() {
    initialize_graph();
    while (1) {
        printf("\nMenu:\n");
        printf("1. Add Computer\n");
        printf("2. Remove Computer\n");
        printf("3. Add Route\n");
        printf("4. Show Network\n");
        printf("5. Find Shortest Path\n");
        printf("6. Transfer Data\n");
        printf("7. Clear Network\n");
        printf("8. Exit\n");
        
        int choice;
        printf("Enter your choice: ");
        scanf("%d", &choice);
        
        if (choice == 1) {
            add_computer();
        } else if (choice == 2) {
            int comp;
            printf("Enter computer index to remove: ");
            scanf("%d", &comp);
            remove_computer(comp);
        } else if (choice == 3) {
            int u, v, weight;
            printf("Enter two computers and latency (ms): ");
            scanf("%d %d %d", &u, &v, &weight);
            add_route(u, v, weight);
        } else if (choice == 4) {
            display_network();
        } else if (choice == 5) {
            int start, end;
            printf("Enter source and destination computers: ");
            scanf("%d %d", &start, &end);
            printf("Choose algorithm: 1. Dijkstra  2. Bellman-Ford\n");
            int alg;
            printf("Enter choice: ");
            scanf("%d", &alg);
            if (alg == 1) {
                dijkstra(start, end);
            } else if (alg == 2) {
                bellman_ford(start, end);
            } else {
                printf("Invalid algorithm choice! Defaulting to Dijkstra.\n");
                dijkstra(start, end);
            }
        } else if (choice == 6) {
            int from, to, packets;
            printf("Enter source, destination, and packets: ");
            scanf("%d %d %d", &from, &to, &packets);
            int params[3] = {from, to, packets};
            pthread_t thread;
            pthread_create(&thread, NULL, data_transfer, params);
            pthread_join(thread, NULL);
        } else if (choice == 7) {
            clear_network();
        } else if (choice == 8) {
            printf("Exiting...\n");
            break;
        } else {
            printf("Invalid choice!\n");
        }
    }
    return 0;
}

void bellman_ford(int start, int end) {
    int distance[MAX_NODES];
    int previous[MAX_NODES];

    for (int i = 0; i < nodes; i++) {
        distance[i] = INT_MAX;
        previous[i] = -1;
    }
    distance[start] = 0;

    // Relax edges repeatedly
    for (int iter = 0; iter < nodes - 1; iter++) {
        bool updated = false;
        for (int u = 0; u < nodes; u++) {
            if (distance[u] == INT_MAX) continue;
            Edge* e = graph[u];
            while (e) {
                int v = e->destination;
                int w = e->weight;
                if (distance[u] + w < distance[v]) {
                    distance[v] = distance[u] + w;
                    previous[v] = u;
                    updated = true;
                }
                e = e->next;
            }
        }
        if (!updated) break; // no change -> stop early
    }

    // Check for negative weight cycles and identify affected nodes
    bool negCycle = false;
    bool affected[MAX_NODES] = {false};
    int affectedCount = 0;
    
    for (int u = 0; u < nodes; u++) {
        if (distance[u] == INT_MAX) continue;
        Edge* e = graph[u];
        while (e) {
            int v = e->destination;
            int w = e->weight;
            if (distance[u] + w < distance[v]) {
                negCycle = true;
                
                // Mark all nodes reachable from v as affected using BFS
                bool visited[MAX_NODES] = {false};
                int queue[MAX_NODES];
                int front = 0, rear = 0;
                queue[rear++] = v;
                visited[v] = true;
                
                while (front < rear) {
                    int node = queue[front++];
                    if (!affected[node]) {
                        affected[node] = true;
                        affectedCount++;
                    }
                    
                    Edge* edge = graph[node];
                    while (edge) {
                        if (!visited[edge->destination]) {
                            visited[edge->destination] = true;
                            queue[rear++] = edge->destination;
                        }
                        edge = edge->next;
                    }
                }
            }
            e = e->next;
        }
        if (negCycle) break;
    }

    if (negCycle) {
        printf("\n⚠️  NEGATIVE WEIGHT CYCLE DETECTED!\n");
        printf("=====================================\n");
        printf("Shortest paths are UNDEFINED for affected nodes.\n");
        printf("Reason: You can loop infinitely to reduce path weight.\n");
        printf("\nAffected nodes: ");
        for (int i = 0; i < nodes; i++) {
            if (affected[i]) {
                printf("%d ", i);
            }
        }
        printf("\n\nRecommendation: Remove negative weight edges or restructure the network.\n");
        printf("=====================================\n");
        
        if (affected[end]) {
            printf("\nDestination node %d is affected by the negative cycle.\n", end);
            printf("Cannot compute shortest path - it would be -∞ (negative infinity).\n");
            return;
        }
    }

    if (distance[end] == INT_MAX) {
        printf("\nNo path from %d to %d found.\n", start, end);
        return;
    }

    printf("\nShortest path from %d to %d: %dms\n", start, end, distance[end]);
    printf("Path: ");
    int current = end;
    while (current != -1) {
        printf("%d <- ", current);
        current = previous[current];
    }
    printf("END\n");
}