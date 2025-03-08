// index.js
require('dotenv').config();
console.log("index.js: Server starting...");
console.log("1")
require("dotenv").config();
console.log("2")
console.log("TEST_VAR:", process.env.CLOUDINARY_CLOUD_NAME); // Log the variable
const app = require("./app");
console.log("3")
const cloudinary = require("cloudinary");
console.log("4")
const fs = require('fs');

const PORT = process.env.PORT || 5001;

process.on("uncaughtException", (err) => {
  console.error(`Error: ${err.message}`);
});

console.log("Cloudinary Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("Cloudinary API Key:", process.env.CLOUDINARY_API_KEY);
console.log("Cloudinary API Secret:", process.env.CLOUDINARY_API_SECRET);

try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("Cloudinary Config Success");
  cloudinary.api.resources()
    .then(result => console.log("Cloudinary resources fetched successfully"))
    .catch(error => console.error("Cloudinary Fetch Error:", error));
} catch (cloudinaryError) {
  console.error("Cloudinary configuration error:", cloudinaryError.message);
  // Optional: process.exit(1); // Exit if Cloudinary fails
}

console.log("After cloudinary.config()");

let deploymentInfo;
try {
  const data = fs.readFileSync('deployment.json', 'utf8');
  deploymentInfo = JSON.parse(data);
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error("Error: deployment.json not found.");
  } else if (error instanceof SyntaxError) {
    console.error("Error: Invalid JSON in deployment.json.");
  } else {
    console.error("Error reading deployment.json:", error);
  }
}

let contractAddress = deploymentInfo ? deploymentInfo.address : null;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (contractAddress) {
    console.log(`Contract address loaded from deployment.json: ${contractAddress}`);
  } else {
    console.log(`Contract address was not loaded, check deployment.json`);
  }
});

process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});