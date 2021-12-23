import { ethers } from "ethers";
import sdk from "./1-initialize-sdk.js";

// Governance contract
const voteModule = sdk.getVoteModule("0xA05707c631356dc4560eC615D22C7F7c238dDa40");

// ERC-20 contract
const tokenModule = sdk.getTokenModule("0x69D643fDf1c528F4C8F80DC1A07Ea1FBAbD2d848");

(async () => {
  try {
    // Give our treasury power to mint additional token if needed
    await tokenModule.grantRole("minter", voteModule.address);

    console.log("Successfully gave vote module permissions to act on token module");
  } catch (error) {
    console.error("Failed to grant vote module permissions to act on token module", error);
    process.exit(1);
  }

  try {
    // Grab our wallet's token balance
    const ownedTokenBalance = await tokenModule.balanceOf(process.env.WALLET_ADDRESS);

    // Grab 90% of the supply we hold
    const ownedAmount = ethers.BigNumber.from(ownedTokenBalance.value);
    const percent90 = ownedAmount.div(100).mul(90);

    // Transfer 90% of the supply to the voting contract aka treasury
    await tokenModule.transfer(voteModule.address, percent90);
    console.log("✅ Successfully transferred tokens to vote module");
  } catch (error) {
    console.error("failed to transfer tokens to vote module", error);
  }
})();
