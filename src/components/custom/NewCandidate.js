import React, { Component } from 'react';
import Web3 from 'web3';
import Election from '../../build/Election.json'

class NewCandidate extends Component {
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

    handleInputChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value,
        })
    }

    async loadBlockChain() {
        const web3 = window.web3
        const accounts = await web3.eth.getAccounts()
        this.setState({ account: accounts[0] })
        const networkId = await web3.eth.net.getId()
        const networkData = Election.networks[networkId]
        if(networkData) {
            const election = new web3.eth.Contract(Election.abi, networkData.address)
            this.setState({ election })
            
            // Check if current account is admin
            const adminAddress = await election.methods.admin().call();
            const isAdmin = accounts[0].toLowerCase() === adminAddress.toLowerCase();
            this.setState({ isAdmin });
            
            if (!isAdmin) {
                alert("Warning: Current account is not the admin. You won't be able to add candidates.");
            }
        } else {
            window.alert('Election contract not deployed to detected network.')
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.addCandidates();
    }
    
    addCandidates() {
        if (!this.state.election) {
            alert("Election contract not loaded yet.");
            return;
        }
    
        if (!this.state.isAdmin) {
            alert("Only admin can add candidates. Please switch to admin account.");
            return;
        }
    
        if (!this.state.candidate_name || !this.state.candidate_details) {
            alert("Please fill in all fields");
            return;
        }
    
        console.log("Submitting candidate:", this.state);
    
        this.setState({ loading: true });
    
        // Convert election_id to number
        const election_id = parseInt(this.props.match.params.id, 10);
        if (isNaN(election_id)) {
            alert("Invalid election ID");
            this.setState({ loading: false });
            return;
        }
    
        this.state.election.methods
            .addCandidate(
                this.state.candidate_name,
                this.state.candidate_details,
                election_id
            )
            .send({ from: this.state.account })
            .then((receipt) => {
                console.log(receipt);
                this.setState({ loading: false });
                window.location.assign("/");
            })
            .catch((error) => {
                console.error("Error adding candidate:", error);
                alert("Error adding candidate. Make sure you are the admin.");
                this.setState({ loading: false });
            });
    }
    
    constructor(props) {
        super(props)
        this.state = {
          account: '',
          election: null,
          candidate_name: null,
          candidate_details: null,
          loading: false,
          isAdmin: false
        }
        this.addCandidates = this.addCandidates.bind(this)
    }

    async componentDidMount() {
        await this.loadWeb3();
        await this.loadBlockChain();
    }

    render() {
        if (this.state.loading) {
            return <div className="container">Processing...</div>
        }

        return(
            <div className="container">
                {!this.state.isAdmin && (
                    <div className="card-panel red lighten-4" style={{marginTop: '20px'}}>
                        <span className="red-text text-darken-4">
                            Warning: Current account is not the admin. Switch to admin account to add candidates.
                        </span>
                    </div>
                )}
                <form onSubmit={this.handleSubmit}>
                    <div className="input-field">
                        <input type="text" id="candidate_name" name="candidate_name" onChange={this.handleInputChange} required/>
                        <label htmlFor="candidate_name">Candidate Name</label>
                    </div>
                    <div className="input-field">
                        <input type="text" id="candidate_details" name="candidate_details" onChange={this.handleInputChange} required/>
                        <label htmlFor="candidate_details">Candidate Details</label>
                    </div>
                    <button 
                        className="btn blue darken-2" 
                        type="submit" 
                        name="action"
                        disabled={this.state.loading || !this.state.isAdmin}
                    >
                        {this.state.loading ? 'Adding...' : 'Submit'}
                        <i className="material-icons right">send</i>
                    </button>
                </form>
            </div>            
        )
    }
}

export default NewCandidate;
