import { createConnection } from 'mysql2';
import express from 'express';
import cors from 'cors';

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5173',
  })
);

// First, create a connection without database specified
const initialConnection = createConnection({
  user: 'root',
  host: 'localhost',
  password: '',
});

// Function to initialize database and tables
const initializeDatabase = async () => {
  try {
    // Create database if it doesn't exist
    await initialConnection.promise().query(`
      CREATE DATABASE IF NOT EXISTS superSimpleSocialNetwork
    `);

    // Switch to the database
    await initialConnection.promise().query(`USE superSimpleSocialNetwork`);

    // Create Users table if it doesn't exist
    await initialConnection.promise().query(`
      CREATE TABLE IF NOT EXISTS Users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        loggedInStatus BOOLEAN DEFAULT FALSE
      )
    `);

    // Create Posts table if it doesn't exist
    await initialConnection.promise().query(`
      CREATE TABLE IF NOT EXISTS Posts (
        post_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        likes INT DEFAULT 0,
        dislikes INT DEFAULT 0,
        user_likes JSON NULL,
        user_dislikes JSON NULL,
        FOREIGN KEY (user_id) REFERENCES Users(user_id)
      )
    `);

    console.log('Database and tables initialized successfully');

    // Close initial connection
    await initialConnection.promise().end();

    // Create the main connection with database specified
    const db = createConnection({
      user: 'root',
      host: 'localhost',
      password: '',
      database: 'superSimpleSocialNetwork',
    });

    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

// Initialize database and start server
const startServer = async () => {
  const db = await initializeDatabase();

  // Routes
  app.get('/', (req, res) => {
    res.send('API is working');
  });

  // Register user function interact with db
  app.post('/register', (req, res) => {
    const { username, password, email } = req.body;

    db.query(
      'INSERT INTO Users (username, password, email) VALUES (?,?,?)',
      [username, password, email],
      (err, result) => {
        if (err) {
          console.error(err);
          if (err.code === 'ER_DUP_ENTRY') {
            if (err.sqlMessage.includes('username')) {
              return res.status(400).send('Username already exists');
            } else if (err.sqlMessage.includes('email')) {
              return res.status(400).send('Email already exists');
            }
          }
          return res.status(500).send('Error registering user');
        }
        // Return the user_id along with success message
        res.status(200).json({
          message: 'User registered successfully',
          user_id: result.insertId,
        });
      }
    );
  });

  // Login function that interacts with db
  app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query(
      'SELECT user_id, username FROM Users WHERE username = ? AND password = ?',
      [username, password],
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error logging in');
        } else if (result.length > 0) {
          db.query(
            'UPDATE Users SET loggedInStatus = TRUE WHERE username = ?',
            [username],
            (updateErr, updateResult) => {
              if (updateErr) {
                console.error(updateErr);
                res.status(500).send('Error updating login status');
              } else {
                res.status(200).json({
                  message: 'Login successful',
                  user_id: result[0].user_id,
                  username: result[0].username,
                });
              }
            }
          );
        } else {
          res.status(401).send('Invalid credentials');
        }
      }
    );
  });

  // Logout function
  app.post('/logout', (req, res) => {
    const { username } = req.body;

    db.query(
      'UPDATE Users SET loggedInStatus = FALSE WHERE username = ?',
      [username],
      (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error logging out');
        } else {
          res.status(200).send('Logout successful');
        }
      }
    );
  });

  // Get posts
  app.get('/posts', (req, res) => {
    db.query(
      `
      SELECT 
        Posts.post_id, 
        Posts.user_id,
        Posts.content, 
        Posts.timestamp, 
        Posts.likes, 
        Posts.dislikes, 
        COALESCE(Posts.user_likes, '[]') AS user_likes, 
        COALESCE(Posts.user_dislikes, '[]') AS user_dislikes, 
        Users.username 
      FROM Posts 
      JOIN Users ON Posts.user_id = Users.user_id 
      ORDER BY Posts.timestamp DESC
    `,
      (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).send(err.message);
        }
        res.status(200).json(result);
      }
    );
  });

  // Create post
  app.post('/posts', (req, res) => {
    const { user_id, content } = req.body;

    if (!user_id || !content) {
      return res.status(400).send('Missing user_id or content');
    }

    db.query(
      'INSERT INTO Posts (user_id, content) VALUES (?, ?)',
      [user_id, content],
      (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).send(err.message);
        }
        res.status(200).send('Post created successfully');
      }
    );
  });

  // Like a post
  app.post('/posts/:postId/like', (req, res) => {
    const { postId } = req.params;
    const { user_id } = req.body;

    const querySelect =
      'SELECT user_likes, user_dislikes FROM Posts WHERE post_id = ?';

    db.query(querySelect, [postId], (err, results) => {
      if (err) return res.status(500).send('Error retrieving post reactions');

      const post = results[0];
      let userLikes = [];
      let userDislikes = [];

      try {
        userLikes = Array.isArray(post.user_likes)
          ? post.user_likes
          : JSON.parse(post.user_likes) || [];
        userDislikes = Array.isArray(post.user_dislikes)
          ? post.user_dislikes
          : JSON.parse(post.user_dislikes) || [];
      } catch (parseErr) {
        console.error('Error parsing user likes/dislikes:', parseErr);
        return res.status(500).send('Error parsing user reactions');
      }

      if (userDislikes.includes(user_id)) {
        userDislikes = userDislikes.filter((id) => id !== user_id);
        db.query(
          'UPDATE Posts SET dislikes = dislikes - 1, user_dislikes = ? WHERE post_id = ?',
          [JSON.stringify(userDislikes), postId]
        );
      }

      if (!userLikes.includes(user_id)) {
        userLikes.push(user_id);
        db.query(
          'UPDATE Posts SET likes = likes + 1, user_likes = ? WHERE post_id = ?',
          [JSON.stringify(userLikes), postId],
          (err) => {
            if (err) return res.status(500).send('Error liking the post');
            res.send('Post liked successfully');
          }
        );
      } else {
        userLikes = userLikes.filter((id) => id !== user_id);
        db.query(
          'UPDATE Posts SET likes = likes - 1, user_likes = ? WHERE post_id = ?',
          [JSON.stringify(userLikes), postId],
          (err) => {
            if (err) return res.status(500).send('Error unliking the post');
            res.send('Post unliked successfully');
          }
        );
      }
    });
  });

  // Dislike a post
  app.post('/posts/:postId/dislike', (req, res) => {
    const { postId } = req.params;
    const { user_id } = req.body;

    const querySelect =
      'SELECT user_likes, user_dislikes FROM Posts WHERE post_id = ?';

    db.query(querySelect, [postId], (err, results) => {
      if (err) return res.status(500).send('Error retrieving post reactions');

      const post = results[0];
      let userLikes = [];
      let userDislikes = [];

      try {
        userLikes = Array.isArray(post.user_likes)
          ? post.user_likes
          : JSON.parse(post.user_likes) || [];
        userDislikes = Array.isArray(post.user_dislikes)
          ? post.user_dislikes
          : JSON.parse(post.user_dislikes) || [];
      } catch (parseErr) {
        console.error('Error parsing user likes/dislikes:', parseErr);
        return res.status(500).send('Error parsing user reactions');
      }

      if (userLikes.includes(user_id)) {
        userLikes = userLikes.filter((id) => id !== user_id);
        db.query(
          'UPDATE Posts SET likes = likes - 1, user_likes = ? WHERE post_id = ?',
          [JSON.stringify(userLikes), postId]
        );
      }

      if (!userDislikes.includes(user_id)) {
        userDislikes.push(user_id);
        db.query(
          'UPDATE Posts SET dislikes = dislikes + 1, user_dislikes = ? WHERE post_id = ?',
          [JSON.stringify(userDislikes), postId],
          (err) => {
            if (err) return res.status(500).send('Error disliking the post');
            res.send('Post disliked successfully');
          }
        );
      } else {
        userDislikes = userDislikes.filter((id) => id !== user_id);
        db.query(
          'UPDATE Posts SET dislikes = dislikes - 1, user_dislikes = ? WHERE post_id = ?',
          [JSON.stringify(userDislikes), postId],
          (err) => {
            if (err) return res.status(500).send('Error undisliking the post');
            res.send('Post undisliked successfully');
          }
        );
      }
    });
  });

  // Capture uncaught exceptions
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1); // Exit process with failure
  });

  // Capture unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1); // Exit process with failure
  });

  // Start server
  app.listen(3000, () => {
    console.log('Running server on port 3000');
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
