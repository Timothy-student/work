// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Election {
    address public admin;

    struct Candidate {
        uint id;
        string name;
        string details;
        uint election_id;
        uint voteCount;
    }

    uint public votingRound = 1;
    mapping(address => uint) public lastVotedRound;
    Candidate[] public candidates;

    event Voted(address voter, uint candidateId);
    event CandidateAdded(uint id, string name, string details, uint election_id);
    event VotesReset();

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function.");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function addCandidate(string memory _name, string memory _details, uint _election_id) public onlyAdmin {
        candidates.push(Candidate(
            candidates.length,
            _name,
            _details,
            _election_id,
            0
        ));
        emit CandidateAdded(candidates.length - 1, _name, _details, _election_id);
    }

    function vote(uint _candidateId) public {
        require(_candidateId < candidates.length, "Invalid candidate ID.");
        require(lastVotedRound[msg.sender] < votingRound, "You have already voted this round.");

        lastVotedRound[msg.sender] = votingRound;
        candidates[_candidateId].voteCount++;

        emit Voted(msg.sender, _candidateId);
    }

    function getCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }

    function resetVotes() public onlyAdmin {
        for (uint i = 0; i < candidates.length; i++) {
            candidates[i].voteCount = 0;
        }
        votingRound += 1;
        emit VotesReset();
    }

    function getCandidateCount() public view returns (uint) {
        return candidates.length;
    }
}
