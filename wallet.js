const axios = require('axios');
const { ethers } = require('ethers');

const etherscanApiKey = 'ZH59BSCHBMA99VTDECNKTXYU23JPSJF91E';

// Generate a new wallet
const wallet = ethers.Wallet.createRandom();

console.log(`Address: ${wallet.address}`);
console.log(`Private Key: ${wallet.privateKey}`);

// The wallet address you want to check the balance and transaction history of
const address = wallet.address;

// Etherscan API URL to fetch balance
const balanceUrl = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${etherscanApiKey}`;

// Etherscan API URL to fetch transaction history
const txHistoryUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${etherscanApiKey}`;

// Fetch the balance
axios.get(balanceUrl)
  .then(response => {
    console.log('API Response for Balance:', response.data);
    if (response.data.result) {
        const balance = ethers.formatEther(response.data.result);
        console.log(`Balance: ${balance} ETH`);
      } else {
        console.log('Error: No result field in API response', response.data);
      }
  })
  .catch(error => {
    console.error('Error fetching balance:', error);
  });

// Fetch the transaction history
axios.get(txHistoryUrl)
  .then(response => {
    console.log('API Response for Transaction History:', response.data);
    if (response.data.result && response.data.result.length > 0) {
      response.data.result.forEach(tx => {
        console.log(`Transaction Hash: ${tx.hash}`);
        console.log(`From: ${tx.from}`);
        console.log(`To: ${tx.to}`);
        console.log(`Value: ${ethers.formatEther(tx.value)} ETH`);
        console.log(`Date: ${new Date(tx.timeStamp * 1000).toLocaleString()}`);
        console.log('---');
      });
    } else {
      console.log('No transactions found for this address.');
    }
  })
  .catch(error => {
    console.error('Error fetching transaction history:', error);
  });
