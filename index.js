const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://Admin:admindbpassword@share-circle.chele9h.mongodb.net/?appName=Share-circle";

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
app.get("/", (req, res) => {
  res.send("Server is running.");
});
async function run() {
  try {
    // // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    const DB = client.db("Share-circle-server-DB");
    const usersCollection = DB.collection("users");

    app.post("/user", async (req, res) => {
      try {
        const user = req.body;

        const result = await usersCollection.updateOne(
          { email: user.email },
          { $setOnInsert: user },
          { upsert: true }
        );

        res.send({
          inserted: result.upsertedCount > 0,
          message: result.upsertedCount
            ? "User created"
            : "User already exists",
        });
      } catch (err) {
        res.status(500).send({ message: "Server error" });
      }
    });
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.listen(port, (req, res) => {
  console.log(`Server is running on port :${port} `);
});
