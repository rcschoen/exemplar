require("dotenv").config();
const http = require("http");
const path = require("path");
const fs = require("fs");
const { MongoClient } = require("mongodb");


const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let collection;

// connect once when server starts
async function connectDB() {
    try {
        await client.connect();
        const db = client.db("servicesDB"); 
        collection = db.collection("products"); 
    } catch (err) {
        console.error(err);
    }
}

connectDB();

/**
 * SERVER URL: 
 */

const server = http.createServer(async(req, res) => {
    
    // 1. Home Page Route
    if (req.url === '/' && req.method === 'GET') {
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
    else if (req.url === '/api' && req.method === 'GET') {
    collection.find({}).toArray()
        .then(data => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        })
        .catch(err => {
            res.writeHead(500);
            res.end(JSON.stringify({ error: "Database error" }));
        });
}

    // 3. Post Route
    else if (req.url === '/api' && req.method === 'POST') {
    let body = "";

    req.on("data", chunk => {
        body += chunk.toString();
    });

    req.on("end", async () => {
        try {
            const newItem = JSON.parse(body);
            const result = await collection.insertOne(newItem);

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        } catch (err) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: "Insert failed" }));
        }
    });
}
    // 4. Update Route
    else if (req.url.startsWith('/api/') && req.method === 'PUT') {
    const id = req.url.split('/')[2];
    let body = '';
        req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                const updates = JSON.parse(body);
                const { ObjectId } = require('mongodb'); 
                    collection.updateOne(
                     { _id: new ObjectId(id) },
                     { $set: updates }
                    )

        .then(result => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result));
        })
        .catch(err => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: "Failed to update product" }));
        });
    });
}

    //5. Delete Route
    else if (req.url.startsWith('/api/') && req.method === 'DELETE') {
    const id = req.url.split('/')[2];
    const { ObjectId } = require('mongodb');
    
        collection.deleteOne({ _id: new ObjectId(id) })
            .then(result => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
            })
            .catch(err => {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: "Failed to delete product" }));
            });
}

    // 4. 404 Not Found
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
