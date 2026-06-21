// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CriminalEvidence {
    struct Evidence {
        uint256 id;
        string caseId;
        string description;
        string documentHash;
        address submittedBy;
        uint256 submittedAt;
        bool approved;
        address reviewedBy;
        bool active;
    }

    address public admin;
    uint256 public evidenceCount;
    mapping(uint256 => Evidence) public evidences;
    mapping(address => bool) public investigators;
    mapping(address => bool) public reviewers;

    event EvidenceSubmitted(uint256 indexed id, string caseId, address indexed submittedBy);
    event EvidenceReviewed(uint256 indexed id, bool approved, address indexed reviewedBy);
    event InvestigatorAdded(address indexed user);
    event ReviewerAdded(address indexed user);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Admin only");
        _;
    }

    modifier onlyInvestigator() {
        require(investigators[msg.sender], "Investigator only");
        _;
    }

    modifier onlyReviewer() {
        require(reviewers[msg.sender], "Reviewer only");
        _;
    }

    constructor() {
        admin = msg.sender;
        investigators[msg.sender] = true;
        reviewers[msg.sender] = true;
    }

    function addInvestigator(address user) external onlyAdmin {
        investigators[user] = true;
        emit InvestigatorAdded(user);
    }

    function addReviewer(address user) external onlyAdmin {
        reviewers[user] = true;
        emit ReviewerAdded(user);
    }

    function submitEvidence(
        string calldata caseId,
        string calldata description,
        string calldata documentHash
    ) external onlyInvestigator {
        evidenceCount += 1;
        evidences[evidenceCount] = Evidence({
            id: evidenceCount,
            caseId: caseId,
            description: description,
            documentHash: documentHash,
            submittedBy: msg.sender,
            submittedAt: block.timestamp,
            approved: false,
            reviewedBy: address(0),
            active: true
        });

        emit EvidenceSubmitted(evidenceCount, caseId, msg.sender);
    }

    function reviewEvidence(uint256 id, bool approved) external onlyReviewer {
        Evidence storage evidence = evidences[id];
        require(evidence.active, "Evidence not active");

        evidence.approved = approved;
        evidence.reviewedBy = msg.sender;

        emit EvidenceReviewed(id, approved, msg.sender);
    }

    function getEvidence(uint256 id) external view returns (Evidence memory) {
        return evidences[id];
    }
}
