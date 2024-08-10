const express = require('express');
const path = require('path');
const { ethers } = require('ethers');
const axios = require('axios');

const app = express();
const port = 3000;

const etherscanApiKey = 'ZH59BSCHBMA99VTDECNKTXYU23JPSJF91E';

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Generate new wallet route
app.get('/wallet', async (req, res) => {
  try {
    const wallet = ethers.Wallet.createRandom();
    const address = wallet.address;

    const balanceUrl = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${etherscanApiKey}`;
    const balanceResponse = await axios.get(balanceUrl);
    const balance = ethers.formatEther(balanceResponse.data.result);

    const txHistoryUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${etherscanApiKey}`;
    const txHistoryResponse = await axios.get(txHistoryUrl);
    const transactions = txHistoryResponse.data.result;

    // Pass ethers to the template
    res.render('result.ejs', { wallet, balance, transactions, ethers });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).send('Error generating wallet or fetching data');
  }
});

// Check existing wallet route
app.get('/check-wallet', async (req, res) => {
  try {
    const address = req.query.address;

    const balanceUrl = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${etherscanApiKey}`;
    const balanceResponse = await axios.get(balanceUrl);
    const balance = ethers.formatEther(balanceResponse.data.result);

    const txHistoryUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${etherscanApiKey}`;
    const txHistoryResponse = await axios.get(txHistoryUrl);
    const transactions = txHistoryResponse.data.result;

    // Pass ethers to the template
    res.render('result.ejs', { wallet: { address }, balance, transactions, ethers });
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).send('Error fetching data for the provided address');
  }
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
