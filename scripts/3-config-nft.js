import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const bundleDrop = sdk.getBundleDropModule("0x84F4fA90d97324ac6bf218605665EfDC994f8b6B");

(async () => {
  try {
    await bundleDrop.createBatch([
      {
        name: "JPEG",
        description: "This NFT will give you access to DegenDAO!",
        image: readFileSync("scripts/assets/jpeg.png"),
      },
    ]);
    console.log("✅ Successfully created a new NFT in the drop!");
  } catch (error) {
    console.error("failed to create the new NFT", error);
  }
})();
