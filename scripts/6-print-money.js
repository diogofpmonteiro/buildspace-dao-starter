import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

// This is the address of our ERC-20 contract printed out in the step before.
const tokenModule = sdk.getTokenModule("0x69D643fDf1c528F4C8F80DC1A07Ea1FBAbD2d848");

(async () => {
  try {
    // Set max supply
    const amount = 1_000_000;

    // We use the util function from "ethers" to convert the amount to 18 decimals (which is the standard for ERC20 tokens)
    const amountWith18Decimals = ethers.utils.parseUnits(amount.toString(), 18);

    // Interact with the deployed ERC-20 contract and mint the tokens
    await tokenModule.mint(amountWith18Decimals);
    const totalSupply = await tokenModule.totalSupply();

    // Print out our token's current supply
    console.log("✅ There now is", ethers.utils.formatUnits(totalSupply, 18), "$DEGEN in circulation");
  } catch (error) {
    console.error("Failed to print money", error);
  }
})();
