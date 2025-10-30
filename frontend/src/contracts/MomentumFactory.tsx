export const MomentumFactoryAbi = [
    {
        "type": "function",
        "name": "MAX_DEADLINE",
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
        "name": "MAX_FUNDING_GOAL",
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
        "name": "MIN_DEADLINE",
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
        "name": "MIN_FUNDING_GOAL",
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
        "name": "createCampaign",
        "inputs": [
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
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "createCampaign",
        "inputs": [
            {
                "name": "_fundingGoal",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "_deadlineInSeconds",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "_title",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "_description",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "_category",
                "type": "string",
                "internalType": "string"
            }
        ],
        "outputs": [
            {
                "name": "campaignAddress",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "getAllDeployedCampaigns",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address[]",
                "internalType": "address[]"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getCampaignDetails",
        "inputs": [
            {
                "name": "_campaign",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "researcher",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "fundingGoal",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "deadline",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "state",
                "type": "uint8",
                "internalType": "enum Campaign.CampaignState"
            },
            {
                "name": "totalFunded",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getCampaignMetadata",
        "inputs": [
            {
                "name": "_campaign",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct MomentumFactory.CampaignMetadata",
                "components": [
                    {
                        "name": "title",
                        "type": "string",
                        "internalType": "string"
                    },
                    {
                        "name": "description",
                        "type": "string",
                        "internalType": "string"
                    },
                    {
                        "name": "category",
                        "type": "string",
                        "internalType": "string"
                    },
                    {
                        "name": "createdAt",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "researcher",
                        "type": "address",
                        "internalType": "address"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getCampaignsByResearcher",
        "inputs": [
            {
                "name": "_researcher",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "address[]",
                "internalType": "address[]"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getDeployedCampaigns",
        "inputs": [
            {
                "name": "_offset",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "_limit",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "campaigns",
                "type": "address[]",
                "internalType": "address[]"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getTotalCampaigns",
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
        "name": "isValidCampaign",
        "inputs": [
            {
                "name": "_campaign",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "s_campaignMetadata",
        "inputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "title",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "description",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "category",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "createdAt",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "researcher",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "s_isValidCampaign",
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
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "event",
        "name": "CampaignCreated",
        "inputs": [
            {
                "name": "researcher",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "campaignAddress",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "fundingGoal",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "deadline",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "title",
                "type": "string",
                "indexed": false,
                "internalType": "string"
            }
        ],
        "anonymous": false
    },
    {
        "type": "error",
        "name": "MomentumFactory__CampaignCreationFailed",
        "inputs": []
    },
    {
        "type": "error",
        "name": "MomentumFactory__InvalidDeadline",
        "inputs": []
    },
    {
        "type": "error",
        "name": "MomentumFactory__InvalidFundingGoal",
        "inputs": []
    }
] as const