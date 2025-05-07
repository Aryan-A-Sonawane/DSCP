#include <stdio.h>
#include <limits.h>
#include <stdbool.h>
#include <stdlib.h>
#include <string.h>
#include <windows.h>

#define MAX_NODES 100
#define FILE_SIZE 500

typedef struct Edge {
    int destination;
    int weight;
    struct Edge* next;
} Edge;

Edge* graph[MAX_NODES];
int sent_packets[MAX_NODES] = {0};
int received_packets[MAX_NODES] = {0};
int nodes = 0;

const char* sampleText =
    "In Dijkstra’s Algorithm, the goal is to find the shortest distance from a given source node to all other nodes in the graph. As the source node is the starting point, its distance is initialized to zero. From there, we iteratively pick the unprocessed node with the minimum distance from the source, this is where a min-heap (priority queue) or a set is typically used for efficiency. For each picked node u, we update the distance to its neighbors v using the formula: dist[v] = dist[u] + weight[u][v], but only if this new path offers a shorter distance than the current known one. This process continues until all nodes have been processed."
    "Step-by-Step Implementation"
    "Set dist=0 and all other distances as infinity."
    "Push the source node into the min heap as a pair <distance, node> → i.e., <0, source>."
    "Pop the top element (node with the smallest distance)."
    "For each adjacent neighbor of the current node:"
    "Calculate the distance using the formula:"
    "dist[v] = dist[u] + weight[u][v]"
    "If this new distance is shorter than the current dist[v], update it."
    "Push the updated pair <dist[v], v> into the min heap"
    "Repeat step 3 until the min heap is empty."
    "Return the distance array, which holds the shortest distance from the source to all nodes.";

void initialize_graph() {
    for (int i = 0; i < MAX_NODES; i++) {
        graph[i] = NULL;
    }
}

void create_computer_file(int index) {
    char filename[20];
    sprintf(filename, "computer%d.txt", index);
    FILE* file = fopen(filename, "w");
    if (file) {
        for (int i = 0; i < FILE_SIZE;) {
            int len = strlen(sampleText);
            int toWrite = (FILE_SIZE - i) < len ? (FILE_SIZE - i) : len;
            fwrite(sampleText, sizeof(char), toWrite, file);
            i += toWrite;
        }
        fclose(file);
    }
}

void delete_computer_file(int index) {
    char filename[20];
    sprintf(filename, "computer%d.txt", index);
    remove(filename);
}

void add_computer() {
    if (nodes < MAX_NODES) {
        create_computer_file(nodes);
        nodes++;
        printf("Computer %d added to the network.\n", nodes - 1);
    } else {
        printf("Network limit reached!\n");
    }
}

void remove_edges_to(int comp) {
    for (int i = 0; i < nodes; i++) {
        if (i == comp) continue;
        Edge** current = &graph[i];
        while (*current) {
            if ((*current)->destination == comp) {
                Edge* temp = *current;
                *current = (*current)->next;
                free(temp);
            } else {
                current = &(*current)->next;
            }
        }
    }
}

void remove_computer(int comp) {
    if (comp >= 0 && comp < nodes) {
        delete_computer_file(comp);
        free(graph[comp]);
        graph[comp] = NULL;
        sent_packets[comp] = 0;
        received_packets[comp] = 0;
        remove_edges_to(comp);
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
        if (graph[i] == NULL) continue;
        printf("Computer %d -> ", i);
        Edge* temp = graph[i];
        while (temp) {
            printf("%d(%dms) ", temp->destination, temp->weight);
            temp = temp->next;
        }
        printf("| Sent: %d | Received: %d\n", sent_packets[i], received_packets[i]);
    }
}

bool is_route_exists(int start, int end) {
    bool visited[MAX_NODES] = {false};
    int queue[MAX_NODES];
    int front = 0, rear = 0;
    queue[rear++] = start;
    visited[start] = true;

    while (front < rear) {
        int current = queue[front++];
        if (current == end) return true;

        Edge* temp = graph[current];
        while (temp) {
            if (!visited[temp->destination]) {
                visited[temp->destination] = true;
                queue[rear++] = temp->destination;
            }
            temp = temp->next;
        }
    }
    return false;
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
            if (!visited[temp->destination] &&
                distance[minIndex] + temp->weight < distance[temp->destination]) {
                distance[temp->destination] = distance[minIndex] + temp->weight;
                previous[temp->destination] = minIndex;
            }
            temp = temp->next;
        }
    }

    if (distance[end] == INT_MAX) {
        printf("\nNo path found between %d and %d. Add a route first.\n", start, end);
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

DWORD WINAPI data_transfer(LPVOID arg) {
    int* params = (int*)arg;
    int from = params[0];
    int to = params[1];
    int bytes = params[2];

    if (!is_route_exists(from, to)) {
        printf("No route exists between %d and %d. Add a route first.\n", from, to);
        return 0;
    }

    sent_packets[from] += bytes;
    received_packets[to] += bytes;

    char fromFile[20], toFile[20];
    sprintf(fromFile, "computer%d.txt", from);
    sprintf(toFile, "computer%d.txt", to);

    FILE* src = fopen(fromFile, "r");
    FILE* dest = fopen(toFile, "a");

    if (src && dest) {
        char* buffer = (char*)malloc(bytes + 1);
        fread(buffer, sizeof(char), bytes, src);
        buffer[bytes] = '\0';

        fprintf(dest, "\nReceived from computer%d: %s\n", from, buffer);
        fclose(dest);

        FILE* logSender = fopen(fromFile, "a");
        if (logSender) {
            fprintf(logSender, "\nData sent to computer%d: %s\n", to, buffer);
            fclose(logSender);
        }

        free(buffer);
        fclose(src);
    } else {
        printf("Error: Could not open files for data transfer.\n");
    }

    for (int i = 0; i <= 100; i += 20) {
        printf("Data transfer: %d%%\n", i);
        Sleep(30);
    }

    printf("Data transfer complete: %d bytes sent from %d to %d.\n", bytes, from, to);
    return 0;
}

void clear_network() {
    for (int i = 0; i < nodes; i++) {
        delete_computer_file(i);
        Edge* temp = graph[i];
        while (temp) {
            Edge* next = temp->next;
            free(temp);
            temp = next;
        }
        graph[i] = NULL;
        sent_packets[i] = 0;
        received_packets[i] = 0;
    }
    nodes = 0;
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
            dijkstra(start, end);
        } else if (choice == 6) {
            int from, to, bytes;
            printf("Enter source, destination, and bytes to send: ");
            scanf("%d %d %d", &from, &to, &bytes);
            int* params = (int*)malloc(3 * sizeof(int));
            params[0] = from;
            params[1] = to;
            params[2] = bytes;

            HANDLE thread = CreateThread(NULL, 0, data_transfer, params, 0, NULL);
            WaitForSingleObject(thread, INFINITE);
            CloseHandle(thread);
            free(params);
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
