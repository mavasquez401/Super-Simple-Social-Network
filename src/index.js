import { createConnection } from 'mysql2';
import express, { json } from 'express';
const cors = require("cors");

app.use(cors())



const app = express()

app.use(express.json())

const db = createConnection({
    user: "root",
    host: "localhost",
    password: "",
    database: "superSimpleSocialNetwork"
})

app.post('/register', (req, res) =>{

    const username = req.body.username
    const password = req.body.password

    db.query("INSERT INTO Users (username, password) VALUES (?,?)", [username, password], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send("Error registering user");
        } else {
            res.status(200).send("User registered successfully");
        }
    })
})


app.listen(3000, () => {
    console.log("running server");
})