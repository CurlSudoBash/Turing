const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:7545'));
const {createHash} = require('crypto');

const votingJSON = require('./build/contracts/Voting');
const votingABI = votingJSON.abi;

const authenticationJSON = require('./build/contracts/Authentication')
const authenticationABI = authenticationJSON.abi;

// Sample Data
// let candidateList = ['Rahul Gandhi','DK Shivakumar','Ramalinga Reddy','Vijay Rupani','Arvind Kejriwal','Narendra Modi'];
// let constituencyList = ['Delhi','Karnataka','Karnataka','Gujarat','Gujarat','Delhi','Gujarat'];
// let votingAddress = "0xFf4A8D81f03dD5432B22B8A0e587A7599cceE748";
// let voterList = ['Manan','Joydeep','Sarthak','Danish','Shaloo','Arjun','Shakaal'];
// let voterConstituencyList = ['Karnataka','Delhi','Delhi','Delhi','Karnataka','Delhi','Mumbai'];
// let authenticationAddress = "0x5fDbBBA04BE10B5Cf8b1420AeAf5Ff62c674fd56";

class Blockchain {

    // Deploys new voting contract and returns votingAddress
    static async deployVotingContract({candidateList = [], constituencyList = []}) {
        const accounts = await web3.eth.getAccounts();
        const votingContract = new web3.eth.Contract(votingABI);
        return votingContract.deploy({
                data: votingJSON.bytecode,
                arguments: [
                    candidateList.map(name => web3.utils.asciiToHex(createHash('sha256').update(name).digest('hex'))),
                    constituencyList.map(constituency => web3.utils.asciiToHex(constituency))
                ]
            }).send({
                from: accounts[0],
                gas: 4700000
            }, (error, transactionHash) => {
                if(error != null) console.log(error);
            }).then(contractInstance => contractInstance.options.address);
    }

    // Deploys new authentication contract and returns authenticationAddress
    static async deployAuthenticationContract({voterList = [], voterConstituencyList = [], votingAddress}) {
        const accounts = await web3.eth.getAccounts();
        const authenticationContract = new web3.eth.Contract(authenticationABI);
        return authenticationContract.deploy({
                data: authenticationJSON.bytecode,
                arguments: [
                    voterList.map(name => web3.utils.asciiToHex(name)),
                    voterConstituencyList.map(constituency => web3.utils.asciiToHex(constituency)),
                    votingAddress
                ]
            }).send({
                from: accounts[1],
                gas: 4700000
            }, (error, transactionHash) => {
                if(error != null) console.log(error);
            }).then(contractInstance => contractInstance.options.address);
    }

    static async registerCandidate({candidate, constituency, votingAddress}) {
        const accounts = await web3.eth.getAccounts();
        const votingInstance = new web3.eth.Contract(votingABI, votingAddress);
        return votingInstance.methods.registerCandidate(
            web3.utils.asciiToHex(createHash('sha256').update(candidate).digest('hex')),
            web3.utils.asciiToHex(constituency))
            .send({
                from: accounts[0], 
                gas: 4700000
            }, (error, transactionHash) => {
                if(error != null) console.log(error);})
                .then(transactionInstance => transactionInstance.status)
                .catch(err => false);
    }

    // Should be called after calling checkVoterAuthenticity
    static async voteForCandidate({candidate, voter, votingAddress}) {
        const accounts = await web3.eth.getAccounts();
        const votingInstance = new web3.eth.Contract(votingABI, votingAddress);
        return votingInstance.methods.voteForCandidate(
            web3.utils.asciiToHex(createHash('sha256').update(candidate).digest('hex')),
            web3.utils.asciiToHex(voter))
            .send({
                from: accounts[0], 
                gas: 4700000
            }, (error, transactionHash) => {
                if(error != null) console.log(error);
            })
            .then(transactionInstance => transactionInstance.status)
            .catch(err => false);
    }

    static async getTotalVotes({candidate, votingAddress}) {
        const votingInstance = new web3.eth.Contract(votingABI, votingAddress);
        return votingInstance.methods
        .totalVotesFor(web3.utils.asciiToHex(
            createHash('sha256').update(candidate).digest('hex')))
        .call()
        .then(res => res['0']);
    }

    static async getCandidateConstituency({candidate, votingAddress}) {
        const votingInstance = new web3.eth.Contract(votingABI, votingAddress);
        return votingInstance.methods
                .getCandidateConstituency(web3.utils.asciiToHex(createHash('sha256').update(candidate).digest('hex')))
                .call()
                .then(res => web3.utils.toAscii(res['1']));
    }

    static async registerVoter({voter, constituency, authenticationAddress}) {
        const accounts = await web3.eth.getAccounts();
        const authenticationInstance = new web3.eth.Contract(authenticationABI, authenticationAddress);
        return authenticationInstance.methods.registerVoter(
            web3.utils.asciiToHex(voter),
            web3.utils.asciiToHex(constituency))
            .send({
                from: accounts[1], 
                gas: 4700000
            }, (error, transactionHash) => {
                if(error != null) console.log(error);
            })
            .then(transactionInstance => transactionInstance.status)
            .catch(err => false);
    }

    static async checkVoterAuthenticity({candidate, voter, authenticationAddress}) {
        const accounts = await web3.eth.getAccounts();
        const authenticationInstance = new web3.eth.Contract(authenticationABI, authenticationAddress);
        return authenticationInstance.methods.isAuthentic(
            web3.utils.asciiToHex(createHash('sha256').update(candidate).digest('hex')),
            web3.utils.asciiToHex(voter))
            .call()
            .then(res => {
                console.log(res['1']);
                return res['0'];
            });
    }
}

module.exports = Blockchain;