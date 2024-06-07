import { createConnection } from 'mysql2';
import express from 'express';
import cors from 'cors';

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173'
}));

// Database connection
const db = createConnection({
    user: "root",
    host: "localhost",
    password: "",
    database: "superSimpleSocialNetwork"
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

// Routes
app.post('/register', (req, res) => {
    const { username, password, email } = req.body;

    db.query("INSERT INTO Users (username, password, email) VALUES (?,?,?)", [username, password, email], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error registering user");
        } else {
            res.status(200).send("User registered successfully");
        }
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query("SELECT * FROM Users WHERE username = ? AND password = ?", [username, password], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error logging in");
        } else if (result.length > 0) {
            res.status(200).send("Login successful");
        } else {
            res.status(401).send("Invalid credentials");
        }
    });
});

// Start server
app.listen(3000, () => {
    console.log("Running server on port 3000");
});
