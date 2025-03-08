// scripts/deploy.js
async function main() {
    try {
        const [deployer] = await hre.ethers.getSigners();
        console.log("Deploying contracts with the account:", deployer.address);

        const SimpleStorage = await hre.ethers.getContractFactory("SimpleStorage");
        const simpleStorage = await SimpleStorage.deploy(42); // Use 42 as initial number

        await simpleStorage.waitForDeployment(); // Corrected line: waitForDeployment

        console.log("Contract deployed to:", await simpleStorage.getAddress()); // getAddress()

        console.log("Deployment successful!");

        // Optionally, you can write the contract address to a file for later use.
        const fs = require('fs');
        const deploymentInfo = {
            address: await simpleStorage.getAddress(),
            deployer: deployer.address,
        };
        fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));

    } catch (error) {
        console.error("Deployment failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });