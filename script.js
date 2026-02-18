const gridContainer = document.getElementById("grid");
const rows = 20;
const cols = 20;

let grid = [];
let startNode = null;
let endNode = null;
let isRunning = false;



function createGrid() {
    for (let row = 0; row < rows; row++) {
        let currentRow = [];

        for (let col = 0; col < cols; col++) {

            const cell = document.createElement("div");
            cell.classList.add("cell");

            cell.addEventListener("click", () => {
                if (!isRunning) handleCellClick(row, col);
            });

            gridContainer.appendChild(cell);

            currentRow.push({
                row,
                col,
                isStart: false,
                isEnd: false,
                isWall: false,
                visited: false,
                distance: Infinity,
                previous: null,
                element: cell
            });
        }

        grid.push(currentRow);
    }
}

createGrid();



function handleCellClick(row, col) {

    const node = grid[row][col];

    if (!startNode) {
        node.isStart = true;
        node.element.classList.add("start");
        startNode = node;
        return;
    }

    if (!endNode && !node.isStart) {
        node.isEnd = true;
        node.element.classList.add("end");
        endNode = node;
        return;
    }

    if (!node.isStart && !node.isEnd) {
        node.isWall = true;
        node.element.classList.add("wall");
    }
}



function resetNodes() {
    for (let row of grid) {
        for (let node of row) {
            node.visited = false;
            node.distance = Infinity;
            node.previous = null;

            node.element.classList.remove("visited");
            node.element.classList.remove("path");
        }
    }
}



function getNeighbors(node) {
    const neighbors = [];
    const { row, col } = node;

    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < rows - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < cols - 1) neighbors.push(grid[row][col + 1]);

    return neighbors;
}


//  BFS 

function bfs(start, end) {

    const queue = [];
    const visitedOrder = [];

    start.visited = true;
    queue.push(start);

    while (queue.length > 0) {
        const current = queue.shift();
        visitedOrder.push(current);

        if (current === end) return visitedOrder;

        for (let neighbor of getNeighbors(current)) {
            if (!neighbor.visited && !neighbor.isWall) {
                neighbor.visited = true;
                neighbor.previous = current;
                queue.push(neighbor);
            }
        }
    }

    return visitedOrder;
}


// DFS

function dfs(start, end) {

    const stack = [];
    const visitedOrder = [];

    start.visited = true;
    stack.push(start);

    while (stack.length > 0) {
        const current = stack.pop();
        visitedOrder.push(current);

        if (current === end) return visitedOrder;

        for (let neighbor of getNeighbors(current)) {
            if (!neighbor.visited && !neighbor.isWall) {
                neighbor.visited = true;
                neighbor.previous = current;
                stack.push(neighbor);
            }
        }
    }

    return visitedOrder;
}


// DIJKSTRA 

function dijkstra(start, end) {

    const visitedOrder = [];
    start.distance = 0;

    let unvisited = grid.flat();

    while (unvisited.length > 0) {

        unvisited.sort((a, b) => a.distance - b.distance);

        const current = unvisited.shift();

        if (current.isWall) continue;
        if (current.distance === Infinity) break;

        current.visited = true;
        visitedOrder.push(current);

        if (current === end) return visitedOrder;

        for (let neighbor of getNeighbors(current)) {
            if (!neighbor.visited && !neighbor.isWall) {
                const newDist = current.distance + 1;
                if (newDist < neighbor.distance) {
                    neighbor.distance = newDist;
                    neighbor.previous = current;
                }
            }
        }
    }

    return visitedOrder;
}



function getShortestPath(endNode) {

    const path = [];
    let current = endNode;

    while (current !== null) {
        path.unshift(current);
        current = current.previous;
    }

    return path;
}


document.getElementById("visualizeBtn").addEventListener("click", () => {

    if (!startNode || !endNode || isRunning) return;

    isRunning = true;
    resetNodes();

    const selected = document.getElementById("algorithm").value;
    const speed = document.getElementById("speed").value;

    let visitedNodes;

    if (selected === "bfs") {
        visitedNodes = bfs(startNode, endNode);
    } else if (selected === "dfs") {
        visitedNodes = dfs(startNode, endNode);
    } else {
        visitedNodes = dijkstra(startNode, endNode);
    }

    const shortestPath = getShortestPath(endNode);

    visitedNodes.forEach((node, index) => {
        setTimeout(() => {
            if (!node.isStart && !node.isEnd) {
                node.element.classList.add("visited");
            }
        }, speed * index);
    });

    setTimeout(() => {
        shortestPath.forEach((node, index) => {
            setTimeout(() => {
                if (!node.isStart && !node.isEnd) {
                    node.element.classList.add("path");
                }
            }, speed * index);
        });

        document.getElementById("info").innerText =
            "Visited Nodes: " + visitedNodes.length +
            " | Path Length: " + shortestPath.length;

        isRunning = false;

    }, speed * visitedNodes.length);
});



document.getElementById("resetBtn").addEventListener("click", () => {

    for (let row of grid) {
        for (let node of row) {

            node.visited = false;
            node.previous = null;
            node.distance = Infinity;
            node.isWall = false;
            node.isStart = false;
            node.isEnd = false;

            node.element.className = "cell";
        }
    }

    startNode = null;
    endNode = null;
    isRunning = false;
    document.getElementById("info").innerText = "";
});
