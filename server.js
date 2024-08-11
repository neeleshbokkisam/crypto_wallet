const express = require('express');
const path = require('path');
const { ethers } = require('ethers');
const axios = require('axios');
const { Wallet } = require('./models');

const app = express();
const port = 3000;

const etherscanApiKey = 'ZH59BSCHBMA99VTDECNKTXYU23JPSJF91E';

// In-memory wallet storage (for demo purposes)
let wallets = {};

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));


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
// Add a new wallet with metadata
app.post('/add-wallet', async (req, res) => {
    const { walletName, privateKey, metadata } = req.body;
    try {
        const wallet = new ethers.Wallet(privateKey);
        await Wallet.create({
            name: walletName,
            address: wallet.address,
            privateKey: wallet.privateKey,
            metadata,
        });
        res.redirect('/wallets');
    } catch (error) {
        console.error('Error adding wallet:', error);
        res.status(400).send('Invalid private key');
    }
});


// View all wallets
app.get('/wallets', async (req, res) => {
    const wallets = await Wallet.findAll();
    res.render('wallets.ejs', { wallets });
});

// View wallet details and metadata
app.get('/wallet-details', async (req, res) => {
    const walletId = req.query.id;
    const wallet = await Wallet.findByPk(walletId);
    if (!wallet) {
        res.status(404).send('Wallet not found');
        return;
    }

    const balanceUrl = `https://api.etherscan.io/api?module=account&action=balance&address=${wallet.address}&tag=latest&apikey=${etherscanApiKey}`;
    const balanceResponse = await axios.get(balanceUrl);
    const balance = ethers.formatEther(balanceResponse.data.result);

    const txHistoryUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${wallet.address}&startblock=0&endblock=99999999&sort=asc&apikey=${etherscanApiKey}`;
    const txHistoryResponse = await axios.get(txHistoryUrl);
    const transactions = txHistoryResponse.data.result;

    res.render('wallet-details.ejs', { wallet, balance, transactions, ethers });
});

// Delete a wallet
app.post('/delete-wallet', async (req, res) => {
    const walletId = req.body.walletId;
    try {
        await Wallet.destroy({ where: { id: walletId } });
        res.redirect('/wallets');
    } catch (error) {
        console.error('Error deleting wallet:', error);
        res.status(500).send('Error deleting wallet');
    }
});

// Edit metadata name
app.post('/edit-metadata', async (req, res) => {
    const walletId = req.body.walletId;
    const newMetadata = req.body.newMetadata;

    try {
        await Wallet.update({ metadata: newMetadata }, { where: { id: walletId } });
        res.redirect('/wallets');
    } catch (error) {
        console.error('Error updating metadata:', error);
        res.status(500).send('Error updating metadata');
    }
});


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
