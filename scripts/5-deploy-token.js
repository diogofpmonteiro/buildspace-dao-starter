import sdk from "./1-initialize-sdk.js";

// In order to deploy the new contract we need the app module
const app = sdk.getAppModule("0x13DEF83260a968CD74861D960762909F524171c6");

(async () => {
  try {
    // Deploy a standard ERC-20 contract.
    const tokenModule = await app.deployTokenModule({
      // Token name
      name: "DegenDAO Governance Token",
      // Token symbol
      symbol: "DEGEN",
    });
    console.log("✅ Successfully deployed token module, address:", tokenModule.address);
  } catch (error) {
    console.error("failed to deploy token module", error);
  }
})();
