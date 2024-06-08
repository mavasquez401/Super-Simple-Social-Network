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

// established connection with db
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

// Routes
// register user function interact with db
app.post('/register', (req, res) => {
    const { username, password, email } = req.body;

    // interacts with db to add username password and email
    db.query("INSERT INTO Users (username, password, email) VALUES (?,?,?)", [username, password, email], (err, result) => {
       
        // check if user was created 
        if (err) {
            console.error(err);
            res.status(500).send("Error registering user");
        } else {
            res.status(200).send("User registered successfully");
        }
    });
});

// login function that interacts with db
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query("SELECT user_id, username FROM Users WHERE username = ? AND password = ?", [username, password], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error logging in");
        } else if (result.length > 0) {
            db.query("UPDATE Users SET loggedInStatus = TRUE WHERE username = ?", [username], (updateErr, updateResult) => {
                if (updateErr) {
                    console.error(updateErr);
                    res.status(500).send("Error updating login status");
                } else {
                    res.status(200).json({
                        message: "Login successful",
                        user_id: result[0].user_id,
                        username: result[0].username
                    });
                }
            });
        } else {
            res.status(401).send("Invalid credentials");
        }
    });
});


// Logout function
app.post('/logout', (req, res) => {
    const { username } = req.body;

    db.query("UPDATE Users SET loggedInStatus = FALSE WHERE username = ?", [username], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error logging out");
        } else {
            res.status(200).send("Logout successful");
        }
    });
});

// connecting sql to get posts
app.get('/posts', (req, res) => {
    db.query("SELECT Posts.post_id, Posts.content, Posts.timestamp, Users.username FROM Posts JOIN Users ON Posts.user_id = Users.user_id ORDER BY Posts.timestamp DESC", (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error fetching posts");
        } else {
            res.status(200).json(result);
        }
    });
});

app.post('/posts', (req, res) => {
    const { user_id, content } = req.body;

    db.query("INSERT INTO Posts (user_id, content) VALUES (?,?)", [user_id, content], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error creating post");
        } else {
            res.status(200).send("Post created successfully");
        }
    });
});

// Start server
app.listen(3000, () => {
    console.log("Running server on port 3000");
});
