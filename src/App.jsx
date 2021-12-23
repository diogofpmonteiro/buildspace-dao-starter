import { useEffect, useMemo, useState } from "react";

// * Import ethers
import { ethers } from "ethers";

// * Import thirdweb
import { useWeb3 } from "@3rdweb/hooks";
import { ThirdwebSDK } from "@3rdweb/sdk";

// * Instantiate the sdk on Rinkeby
const sdk = new ThirdwebSDK("rinkeby");

// * Grab a reference to our DAO NFT ERC-1155 contract
const bundleDropModule = sdk.getBundleDropModule("0x84F4fA90d97324ac6bf218605665EfDC994f8b6B");

// * Grab a reference to our Token ERC-20 contract
const tokenModule = sdk.getTokenModule("0x69D643fDf1c528F4C8F80DC1A07Ea1FBAbD2d848");

// * Grab a reference to our Governance ERC-?? contract
const voteModule = sdk.getVoteModule("0xA05707c631356dc4560eC615D22C7F7c238dDa40");

const App = () => {
  // * Use the connectWallet hook thirdweb gives us
  const { connectWallet, address, error, provider } = useWeb3();
  // console.log("👋 Address:", address);

  // hasClaimedNFT let's us know the user has claimed at least one NFT
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  // isClaiming let's us easily keep a loading state while the NFT is minting
  const [isClaiming, setIsClaiming] = useState(false);
  // Holds the amount of token each member has in state
  const [memberTokenAmounts, setMemberTokenAmounts] = useState({});
  // The array holding all of our members addresses
  const [memberAddresses, setMemberAddresses] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // * A fancy function to shorten someones wallet address, no need to show the whole thing
  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  // The signer is required to sign transactions on the blockchain, without it we can only read data, not write
  const signer = provider ? provider.getSigner() : undefined;

  // This useEffect grabs all our the addresses of our members holding our NFT.
  useEffect(() => {
    const getAddresses = async () => {
      try {
        if (!hasClaimedNFT) return;

        // Just like we did in the 7-airdrop-token.js file. Grab the users who hold our NFT with tokenId 0
        const addresses = await bundleDropModule.getAllClaimerAddresses("0");

        // console.log("🚀 Members addresses", addresses);
        setMemberAddresses(addresses);
      } catch (error) {
        console.error("failed to get member list", error);
      }
    };
    getAddresses();
  }, [hasClaimedNFT]);

  // This useEffect grabs the amount of token each member holds
  useEffect(() => {
    const getAmounts = async () => {
      try {
        if (!hasClaimedNFT) return;

        // Grab all the balances
        const amounts = await tokenModule.getAllHolderBalances();

        // console.log("👜 Amounts", amounts);
        setMemberTokenAmounts(amounts);
      } catch (error) {
        console.error("failed to get token amounts", error);
      }
    };
    getAmounts();
  }, [hasClaimedNFT]);

  useEffect(() => {
    // We pass the signer to the sdk, which enables us to interact with our deployed contract
    sdk.setProviderOrSigner(signer);
  }, [signer]);

  useEffect(() => {
    const isMember = async () => {
      try {
        // If they don't have a connected wallet, exit
        if (!address) return;

        // Check if he user has the NFT by using bundleDropModule.balanceOf
        const balance = await bundleDropModule.balanceOf(address, "0");

        // If balance is greater than 0, they have our NFT!
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          // console.log("🌟 this user is a Degen!");
        } else {
          setHasClaimedNFT(false);
          // console.log("😭 this user doesn't have a membership NFT.");
        }
      } catch (error) {
        setHasClaimedNFT(false);
        console.error("failed to get nft balance", error);
      }
    };
    isMember();
  }, [address]);

  // * Retrieve all existing proposals from the contract
  useEffect(() => {
    const getProposals = async () => {
      try {
        if (!hasClaimedNFT) {
          return;
        }

        // Call to grab all proposals
        const proposals = await voteModule.getAll();
        // Set the state
        setProposals(proposals);
        console.log("🌈 Proposals:", proposals);
      } catch (error) {
        console.error("failed to get proposals", error);
      }
    };
    getProposals();
  }, [hasClaimedNFT]);

  // * Check if member already voted on the first proposal
  useEffect(() => {
    const hasMemberVoted = async () => {
      try {
        if (!hasClaimedNFT) {
          return;
        }

        // If we haven't finished retrieving the proposals from the useEffect above then we can't check if the user voted yet!
        if (!proposals.length) {
          return;
        }

        const hasVoted = await voteModule.hasVoted(proposals[0].proposalId, address);
        setHasVoted(hasVoted);

        console.log("🥵 User has already voted");
      } catch (error) {
        console.error("failed to check if wallet has voted", error);
      }
    };
    hasMemberVoted();
  }, [hasClaimedNFT, proposals, address]);

  // Now, we combine the memberAddresses and memberTokenAmounts into a single array
  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
          // If the address isn't in memberTokenAmounts, it means they don't hold any of our token
          memberTokenAmounts[address] || 0,
          18
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

  const mintNft = () => {
    const mint = async () => {
      try {
        setIsClaiming(true);
        // Call bundleDropModule.claim("0", 1) to mint the nft to user's wallet
        await bundleDropModule.claim("0", 1);
        // Stop loading state
        setIsClaiming(false);
        // Set claim state
        setHasClaimedNFT(true);
        // Show user their new NFT
        console.log(`🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`);
      } catch (error) {
        console.error("failed to claim", error);
        setIsClaiming(false);
      }
    };
    mint();
  };

  if (error && error.name === "UnsupportedChainIdError") {
    return (
      <div className='unsupported-network'>
        <h2>Please connect to Rinkeby</h2>
        <p>This dapp only works on the Rinkeby network, please switch networks in your connected wallet.</p>
      </div>
    );
  }

  // * This is the case where the user hasn't connected their wallet to your web app. Let them call connectWallet
  if (!address) {
    return (
      <div className='landing'>
        <h1>Welcome to Degen DAO</h1>
        <button onClick={() => connectWallet("injected")} className='btn-hero'>
          Connect your wallet
        </button>
      </div>
    );
  }

  // * This is the case where we have the user's address which means they've connected their wallet to our site!
  return (
    <div className='App'>
      <div className='landing'>
        <h1>Welcome to the Degen Dashboard!</h1>
      </div>
      <div className='mint-nft'>
        {!hasClaimedNFT && (
          <>
            <h2>Mint your free membership NFT</h2>
            <button disabled={isClaiming} onClick={() => mintNft()}>
              {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
            </button>
          </>
        )}
        {hasClaimedNFT && (
          <div className='member-page'>
            <h3>Congratulations on being a Degen</h3>
            <div>
              <div>
                <h2>Member List</h2>
                <table className='card'>
                  <thead>
                    <tr>
                      <th>Address</th>
                      <th>Token Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberList.map((member) => {
                      return (
                        <tr key={member.address}>
                          <td>{shortenAddress(member.address)}</td>
                          <td>{member.tokenAmount}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div>
                <h2>Active Proposals</h2>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    //before we do async things, we want to disable the button to prevent double clicks
                    setIsVoting(true);

                    // ? lets get the votes from the form for the values
                    const votes = proposals.map((proposal) => {
                      let voteResult = {
                        proposalId: proposal.proposalId,
                        //abstain by default
                        vote: 2,
                      };
                      proposal.votes.forEach((vote) => {
                        const elem = document.getElementById(proposal.proposalId + "-" + vote.type);

                        if (elem.checked) {
                          voteResult.vote = vote.type;
                          return;
                        }
                      });
                      return voteResult;
                    });

                    // first we need to make sure the user delegates their token to vote
                    try {
                      //we'll check if the wallet still needs to delegate their tokens before they can vote
                      const delegation = await tokenModule.getDelegationOf(address);
                      // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
                      if (delegation === ethers.constants.AddressZero) {
                        //if they haven't delegated their tokens yet, we'll have them delegate them before voting
                        await tokenModule.delegateTo(address);
                      }
                      // then we need to vote on the proposals
                      try {
                        await Promise.all(
                          votes.map(async (vote) => {
                            // before voting we first need to check whether the proposal is open for voting
                            // we first need to get the latest state of the proposal
                            const proposal = await voteModule.get(vote.proposalId);
                            // ! then we check if the proposal is open for voting (state === 1 means it is open)
                            if (proposal.state === 1) {
                              // if it is open for voting, we'll vote on it
                              return voteModule.vote(vote.proposalId, vote.vote);
                            }
                            // if the proposal is not open for voting we just return nothing, letting us continue
                            return;
                          })
                        );
                        try {
                          // if any of the proposals are ready to be executed we'll need to execute them
                          await Promise.all(
                            votes.map(async (vote) => {
                              // we'll first get the latest state of the proposal again, since we may have just voted before
                              const proposal = await voteModule.get(vote.proposalId);

                              // ! if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                              if (proposal.state === 4) {
                                return voteModule.execute(vote.proposalId);
                              }
                            })
                          );
                          // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                          setHasVoted(true);
                          // and log out a success message
                          console.log("successfully voted");
                        } catch (err) {
                          console.error("failed to execute votes", err);
                        }
                      } catch (err) {
                        console.error("failed to vote", err);
                      }
                    } catch (err) {
                      console.error("failed to delegate tokens");
                    } finally {
                      // in *either* case we need to set the isVoting state to false to enable the button again
                      setIsVoting(false);
                    }
                  }}>
                  {proposals.map((proposal, index) => (
                    <div key={proposal.proposalId} className='card'>
                      <h5>{proposal.description}</h5>
                      <div>
                        {proposal.votes.map((vote) => (
                          <div key={vote.type}>
                            <input
                              type='radio'
                              id={proposal.proposalId + "-" + vote.type}
                              name={proposal.proposalId}
                              value={vote.type}
                              // default the "abstain" vote to checked
                              defaultChecked={vote.type === 2}
                            />
                            <label htmlFor={proposal.proposalId + "-" + vote.type}>{vote.label}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button disabled={isVoting || hasVoted} type='submit'>
                    {isVoting ? "Voting..." : hasVoted ? "You Already Voted" : "Submit Votes"}
                  </button>
                  <small>This will trigger multiple transactions that you will need to sign.</small>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
