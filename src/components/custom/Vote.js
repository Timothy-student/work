import React, { Component } from 'react';
import Web3 from 'web3';
import Election from '../../build/Election.json'

class Vote extends Component {

    async componentWillMount() {
        await this.loadWeb3()
        await this.loadBlockchainData()
    }
    
    async loadWeb3() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()
        }
        else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider)
        }
        else {
            window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    }

    async loadBlockchainData() {
        try {
            const web3 = window.web3
            const accounts = await web3.eth.getAccounts()
            console.log('Connected account:', accounts[0])
            this.setState({ account: accounts[0] })
            
            const networkId = await web3.eth.net.getId()
            const networkData = Election.networks[networkId]
            
            if(networkData) {
                const election = new web3.eth.Contract(Election.abi, networkData.address)
                this.setState({ election })
                
                const candidates = await election.methods.getCandidates().call()
                this.setState({ 
                    candidates: candidates,
                    loading: false 
                })
                
                console.log('Candidates loaded:', candidates)
            } else {
                console.error('Election contract not deployed to detected network.')
                window.alert('Election contract not deployed to detected network.')
            }
        } catch (error) {
            console.error('Error loading blockchain data:', error)
            window.alert('Failed to load blockchain data. Check console for details.')
        }
    }

    handleVote = async (candidateId) => {
        try {
            this.setState({ loading: true })
            await this.state.election.methods.vote(candidateId)
                .send({ from: this.state.account })
            this.setState({ loading: false })
            window.location.assign("/")
        } catch (error) {
            console.error('Error voting:', error)
            this.setState({ loading: false })
            window.alert('Error voting. Check console for details.')
        }
    }

    constructor(props) {
        super(props)
        this.state = {
            account: '',
            election: null,
            candidates: [],
            loading: true
        }
    }

    render() {
        if (this.state.loading) {
            return (
                <div className="container">
                    <p>Loading...</p>
                </div>
            )
        }

        return(
            <div className="container">
                <ul className="collection">
                    <li className="collection-item avatar">
                        <h3>Candidates</h3>
                    </li>
                    {this.state.candidates.map((candidate, index) => (
                        <div className="contact" key={index}>
                            <li className="collection-item avatar">
                                <i className="material-icons circle blue darken-2">ballot</i>
                                <p><b>{candidate.name}</b></p>
                                <p>Votes: {candidate.voteCount}</p>
                                <a href="#!" className="secondary-content">
                                    <button 
                                        onClick={() => this.handleVote(candidate.id)} 
                                        className="waves-effect waves-light btn blue darken-2"
                                    >
                                        Vote
                                    </button>
                                </a>
                            </li>
                        </div>
                    ))}
                </ul>
            </div>
        )
    }
}

export default Vote;