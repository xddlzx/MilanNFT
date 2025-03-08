const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
console.log("a")
const cookieParser = require("cookie-parser");
console.log("b")
const fileUpload = require("express-fileupload");
console.log("c")
const { ethers } = require('ethers');
console.log("d")
const app = express();
console.log("e")

// config
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: ".env" });
}
console.log("f")

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());
console.log("q")
const user = require("./routes/userRoute.js");
console.log("ege")
const product = require("./routes/productRoute");
const order = require("./routes/orderRoute");
const payment = require("./routes/paymentRoute");
console.log("w")
app.use("/api/user", user);
app.use("/api/product", product);
app.use("/api/order", order);
app.use("/api/payment", payment);

// deployment
__dirname = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Server is Running! 🚀");
  });
}

app.get('/test', (req, res) => {
  console.log("Test route hit!");
  res.send("Hello from test route!");
});

const contractAddress = "0x9A676e781A523b5d0C0e43731313A708CB607508"; // Manual contract address

const contractABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_initialNumber",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "getNumber",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "myNumber",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_newNumber",
        "type": "uint256"
      }
    ],
    "name": "setNumber",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const networkProvider = "http://localhost:8545";

app.get('/api/contract-info', async (req, res) => {
  console.log("API endpoint hit: /api/contract-info");

  if (!contractAddress) {
    console.error("Contract address not available");
    return res.status(500).json({ error: "Contract address not available" });
  }

  console.log("Using contract address:", contractAddress);
  console.log("Using network provider:", networkProvider);

  try {
    console.log("Creating provider...");
    const provider = new ethers.providers.JsonRpcProvider(networkProvider);

    console.log("Creating contract instance...");
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );

    console.log("Calling getNumber()...");
    const number = await contract.getNumber();

    console.log("Number retrieved:", number.toString());
    const contractInfo = { number: number.toString() };

    console.log("Sending response:", contractInfo);
    return res.json({ info: contractInfo });
  } catch (error) {
    console.error("Error details:", error);
    return res.status(500).json({ error: "Failed to fetch contract info", details: error.message });
  }
});

// error middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack to the console

  // Set the response status code and send an error message
  res.status(500).send({
    error: 'Internal Server Error',
    message: err.message, // Include the error message
  });
});
// app.use(errorMiddleware);

module.exports = app;