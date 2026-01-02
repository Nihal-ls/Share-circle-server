const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const donationsCollection = DB.collection("items-for-donation");

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
    app.post("/donations", async (req, res) => {
      try {
        const donation = req.body;
        donation.createdAt = new Date();

        const result = await donationsCollection.insertOne(donation);
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: "Failed to add donation" });
      }
    });

    // getting items which are for donation
    app.get('/items', async (req, res) => {
      const result = await donationsCollection.find().toArray()
      res.send(result)
    })
    // donation items details
    app.get('/items/:id', async (req, res) => {
      try {
        const id = req.params.id;

        const query = { _id: new ObjectId(id) };
        const result = await donationsCollection.findOne(query);

        if (!result) {
          return res.status(404).send({ message: 'Item not found' });
        }

        res.send(result);
      } catch (error) {
        res.status(400).send({ message: 'Invalid ID' });
      }
    });



    // user role
    app.get('/users/role/:email', async (req, res) => {
      const email = req.params.email
      const result = await usersCollection.findOne({ email })
      res.send({ role: result?.role })
    })

    // getting users for admin
    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray()
      res.send(result)
    })

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
