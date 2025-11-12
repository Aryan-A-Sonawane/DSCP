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
        Edge* newEdge = (Edge*)malloc(sizeof(Edge));
        newEdge->destination = v;
        newEdge->weight = weight;
        newEdge->next = graph[u];
        graph[u] = newEdge;

        Edge* reverseEdge = (Edge*)malloc(sizeof(Edge));
        reverseEdge->destination = u;
        reverseEdge->weight = weight;
        reverseEdge->next = graph[v];
        graph[v] = reverseEdge;

        printf("Route added between %d and %d with latency %dms.\n", u, v, weight);
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

void dijkstra(int start, int end) {
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

    // Check for negative weight cycles
    bool negCycle = false;
    for (int u = 0; u < nodes; u++) {
        if (distance[u] == INT_MAX) continue;
        Edge* e = graph[u];
        while (e) {
            int v = e->destination;
            int w = e->weight;
            if (distance[u] + w < distance[v]) {
                negCycle = true;
                break;
            }
            e = e->next;
        }
        if (negCycle) break;
    }

    if (negCycle) {
        printf("Negative weight cycle detected - shortest paths may be undefined.\n");
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