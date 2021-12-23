import sdk from "./1-initialize-sdk.js";

const bundleDrop = sdk.getBundleDropModule("0x84F4fA90d97324ac6bf218605665EfDC994f8b6B");

(async () => {
  try {
    const claimConditionFactory = bundleDrop.getClaimConditionFactory();
    // Specify conditions - when to start the minting, how many NFTs can be minted, etc
    claimConditionFactory.newClaimPhase({
      startTime: new Date(),
      maxQuantity: 5000,
      maxQuantityPerTransaction: 1,
    });

    await bundleDrop.setClaimCondition(0, claimConditionFactory);
    console.log("✅ Successfully set claim condition!");
  } catch (error) {
    console.error("Failed to set claim condition", error);
  }
})();
