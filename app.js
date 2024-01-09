const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
app.use(cors());

// Initialize Mongo
const { MongoClient } = require("mongodb");
const uri = "mongodb://localhost:27017/dogdb";

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello Express!");
});

app.post("/register", async (req, res) => {
  const usersCollection = client.db("dogdb").collection("users");

  let dbResult = await usersCollection.insertOne({
    username: req.body.username,
    password: req.body.password,
  });

  if (dbResult.acknowledged === true) {
    const user = await usersCollection.findOne({ _id: dbResult.insertedId });
    console.log("User", user);
    return res.status(200).send(user);
  }

  return res.sendStatus(500);
});

app.post("/login", async (req, res) => {
  const usersCollection = client.db("dogdb").collection("users");
  let user = await usersCollection.findOne({ username: req.body.username });

  if (user !== null) {
    console.log("User", user);

    // Check User against inputs
    if (req.body.password === user.password) {
      console.log("Password Match");
      return res.status(200).send({
        id: user._id.toString(),
        username: user.userName,
      });
    }

    console.log("Password Does not Match");
  }

  console.log("Body", req.body);
  res.sendStatus(500);
});

app.get("/comments/:id", async (req, res) => {
  // Get Comments for picture ID
  const commentCollection = client.db("dogdb").collection("comments");
  let comments = await commentCollection
    .find({ picId: req.params.id })
    .toArray();

  return res.status(200).send(comments);
});

app.post("/comments", async (req, res) => {
  // Post a comment
  const commentCollection = client.db("dogdb").collection("comments");
  let dbResult = await commentCollection.insertOne({
    username: req.body.username,
    comment: req.body.comment,
    picId: req.body.picId,
  });

  if (dbResult.acknowledged === true) {
    const comment = await commentCollection.findOne({
      _id: dbResult.insertedId,
    });
    console.log("Comment", comment);
    return res.status(200).send(comment);
  }

  return res.sendStatus(500);
});

app.listen(port, async () => {
  console.log(`Server is listening at http://localhost:${port}`);

  client = new MongoClient(uri);
  client.connect((err) => {
    if (err) throw err;
    console.log("Connected to DB");
  });

  // Reset DB
  client.db("dogdb").collection("users").deleteMany({});
  client.db("dogdb").collection("comments").deleteMany({});
});
