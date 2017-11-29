// @flow

import React from 'react';
import { render } from 'react-dom';
import Index from './pages/index';
import Owner from './pages/owner';
import Beneficiary from './pages/beneficiary';

import AllowanceContract from './build/Allowance.json'
import getWeb3 from './utils/getWeb3'
import { Component } from 'react'

import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import Input, { InputLabel } from 'material-ui/Input';
import { FormControl, FormHelperText } from 'material-ui/Form';



import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

const rootElement = document.querySelector('#root');

class Variables extends Component {
  
state = {
  open: false,
};


handleRequestClose = () => {
  this.setState({
    open: false,
  });
};

handleClick = () => {
  this.setState({
    open: true,
  });
};

handleChange = () => {
console.log(this.value)
};



handleAddFunds = () => {
  this.setState({
    fundsToAdd: 1,
  });
  console.log('Paso por HandleAddFunds')
  addFundsRequest(1);
};

}

var globals = new Object();
// INICIO CODIGO IMPORTADO
globals.state = {
  contractAddress: "",
  contractBalance: "",
  addFundsValue: 0,
  lastWithdrawalDate: null,
  ownerAddress: "",
  message: "Estoy en Message",
  role: "",
  web3: null
}

const valores = {
  root: {
    role: 'owner',
    paddingTop: 200,
  },
};


const styles = {
  root: {
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: 100 * 3,
  },
};

console.log(styles)

loadWeb3();

async function loadWeb3() { 
  try {
  let results = await getWeb3
  globals.state.web3 = results.web3
  //console.log(globals.state.web3.currentProvider)
  initContract();
  } catch (e) {
    console.log("error")
  }
}



async function addFundsRequest(_addFundsValue) {
  
      let addFundsValue = _addFundsValue * 1000000000000000000
      console.log('Click en AddFunds')
      try {
        let contract = require('truffle-contract')
        let allowance = contract(AllowanceContract)
        allowance.setProvider(this.state.web3.currentProvider)
  
        //let accounts = await this.state.web3.eth.getAccounts();
        let allowanceInstance = await allowance.deployed();
        //let contractBalanceValue = await allowanceInstance.getBalance.call({from: accounts[0]});
        //let lastWithdrawalDateValue = await allowanceInstance.getLastWithdrawalDate();
        //let beneficiary = await allowanceInstance.getBeneficiary();
        let owner = await allowanceInstance.getOwner();
      
  
        let addFundsPromise = await allowanceInstance.addFunds({from: owner, value: addFundsValue });
        console.log(addFundsPromise);
  
        } catch (e){
      }
  
    }



async function initContract() {
   
      let contract = require('truffle-contract')
      let allowance = contract(AllowanceContract)
      allowance.setProvider(globals.state.web3.currentProvider)
  
      let accounts = await globals.state.web3.eth.getAccounts();
      let allowanceInstance = await allowance.deployed();


      let loggedAccount = await window.web3.eth.defaultAccount;
      let beneficiaryAccount = await allowanceInstance.getBeneficiary();
      let ownerAccount = await allowanceInstance.getOwner();
      
      // Identifico el rol
      if (loggedAccount.toLowerCase() === ownerAccount.toLowerCase()) {
        globals.state.role = "owner";
      } else {
        if (loggedAccount.toLowerCase() === beneficiaryAccount.toLowerCase()) {
          globals.state.role = "beneficiary";
        } else {
          globals.state.role = "unknown";
        }
      }

       

      let beneficiaryBalance =  await globals.state.web3.eth.getBalance(beneficiaryAccount)
      console.log("Beneficiary Balance:",beneficiaryBalance/1000000000000000000)

      let ownerBalance =  await globals.state.web3.eth.getBalance(ownerAccount)
      console.log("Owner Balance:",ownerBalance/1000000000000000000)

      let contractBalance =  await globals.state.web3.eth.getBalance(allowanceInstance.address)
      console.log("Contract Balance:", contractBalance/1000000000000000000)



      //let contractBalanceValue = await allowanceInstance.getBalance.call({from: ownerAccount});
      let contractBalanceValue = await globals.state.web3.eth.getBalance(allowanceInstance.address)      


      //let lastWithdrawalDateValue = await allowanceInstance.getLastWithdrawalDate();

      
      globals.state.contractAddress = allowanceInstance.address;
      globals.state.ownerAddress = ownerAccount;
      globals.state.beneficiaryAddress = beneficiaryAccount;
      //globals.state.lastWithdrawalDate = lastWithdrawalDateValue.c[0];
      globals.state.contractBalance = contractBalanceValue /1000000000000000000;
      globals.state.ownerBalance = ownerBalance/1000000000000000000;
      

      console.log('Contract Balance: ',  globals.state.contractBalance);


      if (rootElement) {
        switch (globals.state.role) {
          case 'owner':
            render(
            <div> 
              <Paper className={styles.root} elevation={4}>
                <Typography type="display1" gutterBottom>
                Logged as OWNER
                </Typography>

                <Typography type="subheading" gutterBottom>
                Contract Address: {globals.state.contractAddress}
                </Typography>

                <Typography type="subheading" gutterBottom>
                Contract Balance: {globals.state.contractBalance} ether
                </Typography>

                <Typography type="subheading" gutterBottom>
                Owner Address: {globals.state.ownerAddress}
                </Typography>

                <Typography type="subheading" gutterBottom>
                Owner Balance: {globals.state.ownerBalance} ether
                </Typography>

                <FormControl>
                <InputLabel htmlFor="name-helper">Funds to Add</InputLabel>
                <Input id="name-helper" onUpdate={Variables.handleChange} />
                <FormHelperText>Add Funds to Contract</FormHelperText>
                </FormControl>
                <Button raised color="primary" onClick={addFundsRequest}>
                Add Funds
                </Button>

                <Button raised color="accent" onClick={Variables.handleClick}>
                Withdraw All Funds
                </Button>

              </Paper>

            </div>, rootElement);    
          break;
  
          case 'beneficiary':
            render(<Beneficiary />, rootElement);
          break;
  
          default:
            render(<Index />, rootElement);
        }
      }

      try {
      } catch (e){
        console.log("pincha todo")
        console.log(e)
    }
  }



// FIN CODIGO IMPORTADO