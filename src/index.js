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

var globals = new Object();

globals.state = {
  contractAddress: "",
  contractBalance: "",
  addFundsValue: 0,
  lastWithdrawalDate: null,
  ownerAddress: "",
  message: "Estoy en Message",
  addFunds: 0,
  role: "",
  web3: null
}

loadWeb3();

async function loadWeb3() { 
  try {
    let results = await getWeb3
    globals.state.web3 = results.web3
    initContract();
  } catch (e) {
    console.log(e.message)
  }
}


function handlerOnChangeInput() {
  console.log("ingreso en handlerOnChangeInput")
  console.log(this)
}


async function addFundsRequest(event) {

  const {target} = event;
  const {value} = target;
  let _addFundsValue = 1;
  let addFundsValue = _addFundsValue * 1000000000000000000
  
  console.log('Click en AddFunds')
  console.log("globals addfund", globals.state.addFunds)
  
  try {

    let contract = require('truffle-contract')
    let allowance = contract(AllowanceContract)
    allowance.setProvider(globals.state.web3.currentProvider)
    let allowanceInstance = await allowance.deployed();
    let owner = await allowanceInstance.getOwner();
    let addFundsPromise = await allowanceInstance.addFunds({from: owner, value: addFundsValue });
    
    console.log(owner)
    console.log(addFundsPromise);

  } catch (e){
    console.log(e.message)
  }
  
}

async function withdrawBeneficiary() {
  
  try {
    let contract = require('truffle-contract')
    let allowance = contract(AllowanceContract)
    allowance.setProvider(globals.state.web3.currentProvider)
    let allowanceInstance = await allowance.deployed();
    let beneficiary = await allowanceInstance.getBeneficiary();
    let WithdrawBeneficiaryPromise = await allowanceInstance.withdrawBeneficiary({from: beneficiary});
    
    console.log(WithdrawBeneficiaryPromise);
  
  } catch (e){
    console.log(e.message)
  }

}


async function withdrawAll() {

  try {
      let contract = require('truffle-contract')
      let allowance = contract(AllowanceContract)
      allowance.setProvider(globals.state.web3.currentProvider)
      let allowanceInstance = await allowance.deployed();
      let owner = await allowanceInstance.getOwner();
      let WithdrawAllFundsPromise = await allowanceInstance.withdrawOwnerAll({from: owner});
  
      console.log(WithdrawAllFundsPromise);
  
    } catch (e){
      console.log(e.message)
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
  let ownerBalance =  await globals.state.web3.eth.getBalance(ownerAccount)
  let contractBalance =  await globals.state.web3.eth.getBalance(allowanceInstance.address)
  let contractBalanceValue = await globals.state.web3.eth.getBalance(allowanceInstance.address)      

  globals.state.contractAddress = allowanceInstance.address;
  globals.state.ownerAddress = ownerAccount;
  globals.state.beneficiaryAddress = beneficiaryAccount;
  globals.state.contractBalance = contractBalanceValue /1000000000000000000;
  globals.state.ownerBalance = ownerBalance/1000000000000000000;
  globals.state.beneficiaryBalance = beneficiaryBalance / 1000000000000000000;

  console.log('Contract Balance: ',  globals.state.contractBalance);
  console.log("Owner Balance:", globals.state.ownerBalance)
  console.log("Beneficiary Balance:",globals.state.beneficiaryBalance)


  // Render Page Logic 
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
            <Input id="name-helper" onChange={handlerOnChangeInput.bind(this)} />
            <FormHelperText>Add Funds to Contract</FormHelperText>
            </FormControl>

            <Button raised color="primary" onClick={addFundsRequest.bind(this)}>Add Funds</Button>
            <Button raised color="accent" onClick={withdrawAll}>Withdraw All Funds</Button>
          
          </Paper>
        </div>, rootElement);    
      break;

      case 'beneficiary':
        render(
          <div> 
          <Paper className={styles.root} elevation={4}>
            
            <Typography type="display1" gutterBottom>
            Logged as BENEFICIARY
            </Typography>

            <Typography type="subheading" gutterBottom>
            Contract Address: {globals.state.contractAddress}
            </Typography>

            <Typography type="subheading" gutterBottom>
            Contract Balance: {globals.state.contractBalance} ether
            </Typography>

            <Typography type="subheading" gutterBottom>
            Beneficiary Address: {globals.state.beneficiaryAddress}
            </Typography>

            <Typography type="subheading" gutterBottom>
            Beneficiary Balance: {globals.state.beneficiaryBalance} ether
            </Typography>

            <Button raised color="accent" onClick={withdrawBeneficiary}>Withdraw Beneficiary Funds</Button>

          </Paper>
        </div>, rootElement);    
      break;

      default:
        render(
        <div> 
          <Paper className={styles.root} elevation={4}>
           
            <Typography type="display1" gutterBottom>
              You must be logged as Owner or Beneficiary
            </Typography>

            <Typography type="subheading" gutterBottom>
            Contract Address: {globals.state.contractAddress}
            </Typography>

            <Typography type="subheading" gutterBottom>
            Contract Balance: {globals.state.contractBalance} ether
            </Typography>

          </Paper>
        </div>            
        , rootElement);
    }
  }

  try {
  } catch (e.message){
    console.log("pincha todo")
    console.log(e)
  }
}