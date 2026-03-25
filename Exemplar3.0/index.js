const http = require("http");
const path = require("path");
const fs = require("fs");

/**
 * SERVER URL: https://exemplar-hz51.onrender.com
 */

const server = http.createServer((req, res) => {
    
    // 1. Home Page Route
    if (req.url === '/') {
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end("Error loading index.html");
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        });
    }

    // 2. API Route
    else if (req.url === '/api') {
        fs.readFile(path.join(__dirname, 'public', 'db.json'), 'utf-8', (err, content) => {
            if (err) {
                res.writeHead(500);
                res.end(JSON.stringify({ error: "Could not read database file" }));
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(content);
        });
    }

    // 3. 404 Not Found
    else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end("<h1>404: Page not found</h1>");
    }
});

// environment PORT 
const PORT = process.env.PORT || 5959;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
