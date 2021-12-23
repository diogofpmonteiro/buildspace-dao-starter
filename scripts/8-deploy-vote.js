import sdk from "./1-initialize-sdk.js";

// Grab app module address
const appModule = sdk.getAppModule("0x13DEF83260a968CD74861D960762909F524171c6");

(async () => {
  try {
    const voteModule = await appModule.deployVoteModule({
      // Governance contract name:
      name: "Degen's Proposals",

      // The location of the governance token is in our ERC-20 contract!
      votingTokenAddress: "0x69D643fDf1c528F4C8F80DC1A07Ea1FBAbD2d848",

      // After a new proposal is created, when can members start voting (0 = immediately)
      proposalStartWaitTimeInSeconds: 0,

      // How long do members have to vote on a proposal when it's created? (24h here)
      proposalVotingTimeInSeconds: 24 * 60 * 60,

      // A minimum x % of tokens total supply must be used in the vote
      votingQuorumFraction: 0,

      // Minimum # of tokens a user needs to be allowed to CREATE a proposal
      minimumNumberOfTokensNeededToPropose: "100",
    });

    console.log("Successfully deployed vote module, address: ", voteModule.address);
  } catch (error) {
    console.log("Failed to deploy vote module", error);
  }
})();
