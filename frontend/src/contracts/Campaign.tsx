export const CampaignAbi = [
    {
        "type": "constructor",
        "inputs": [
            {
                "name": "_researcher",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "_fundingGoal",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "_deadlineInSeconds",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "claimRefund",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "finalizeCampaign",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "fund",
        "inputs": [],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "getResearchUpdates",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "string[]",
                "internalType": "string[]"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "i_deadline",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "i_fundingGoal",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "i_researcher",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "s_backers",
        "inputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "s_campaignState",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint8",
                "internalType": "enum Campaign.CampaignState"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "s_researchUpdates",
        "inputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "string",
                "internalType": "string"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "s_totalFunded",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "submitResearchUpdate",
        "inputs": [
            {
                "name": "_ipfsHash",
                "type": "string",
                "internalType": "string"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "withdrawFunds",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "CampaignFinalized",
        "inputs": [
            {
                "name": "finalState",
                "type": "uint8",
                "indexed": false,
                "internalType": "enum Campaign.CampaignState"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "CampaignFunded",
        "inputs": [
            {
                "name": "funder",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "CampaignWithdrawn",
        "inputs": [
            {
                "name": "researcher",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Refunded",
        "inputs": [
            {
                "name": "backer",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "ResearchUpdateSubmitted",
        "inputs": [
            {
                "name": "researcher",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "ipfsHash",
                "type": "string",
                "indexed": false,
                "internalType": "string"
            }
        ],
        "anonymous": false
    },
    {
        "type": "error",
        "name": "Campaign__AlreadyFinalized",
        "inputs": []
    },
    {
        "type": "error",
        "name": "Campaign__DeadlineHasPassed",
        "inputs": []
    },
    {
        "type": "error",
        "name": "Campaign__DeadlineNotPassed",
        "inputs": []
    },
    {
        "type": "error",
        "name": "Campaign__MustSendMoreThanZero",
        "inputs": []
    },
    {
        "type": "error",
        "name": "Campaign__NoFundsToRefund",
        "inputs": []
    },
    {
        "type": "error",
        "name": "Campaign__NotInCorrectStateForUpdate",
        "inputs": []
    },
    {
        "type": "error",
        "name": "Campaign__NotInFailedState",
        "inputs": []
    },
    {
        "type": "error",
        "name": "Campaign__NotInOpenState",
        "inputs": []
    },
    {
        "type": "error",
        "name": "Campaign__NotInSuccessfulState",
        "inputs": []
    },
    {
        "type": "error",
        "name": "Campaign__NotResearcher",
        "inputs": []
    },
    {
        "type": "error",
        "name": "Campaign__TransferFailed",
        "inputs": []
    },
    {
        "type": "error",
        "name": "ReentrancyGuardReentrantCall",
        "inputs": []
    }
] as const;