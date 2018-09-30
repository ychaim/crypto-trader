const debug = require('debug')('trader:gdax');
const security = require('../authentication/security');

const express = require('express');
const router = express.Router();

/**
 * Get the authentication from environment variables
 */
const key = process.env.GDAX_KEY;
const secret = process.env.GDAX_SECRET;
const passPhrase = process.env.GDAX_PASSPHRASE;
const apiUrl = process.env.GDAX_API_URL;

debug('API URL: %s', apiUrl)
debug('Key: %s', key)
debug('Secret: %s', secret)
debug('Pass Phrase: %s', passPhrase)

const CoinBasePublic = require('../../crypto-trader2/lib/coinbase_public_api');
const CoinBaseAuthenticated = require('../../crypto-trader2/lib/coinbase_authenticated_api');

let authenticatedAPI = new CoinBaseAuthenticated(apiUrl, key, secret, passPhrase);
let publicAPI = new CoinBasePublic(apiUrl);

/**
 * Index page
 */
router.get('/', function (req, res, next) {
    res.redirect('/');
});

/**
 * Get the products offered by the exchange
 */
router.get('/products', security.isAuthenticated, function (req, res, next) {

    publicAPI.getProducts()
        .then(data => {
            res.render('products', { data: data, title: 'Products' });
        })
        .catch(error => {
            res.render('error', { message: "Error getting products", error: error });
        });

});

/**
 * Get the ticker information for a product
 */
router.get('/product-ticker/:product', security.isAuthenticated, function (req, res, next) {
    const productCode = req.params.product;

    publicAPI.getProductTicker(productCode)
        .then(data => {
            res.render('product-ticker', { data: data, title: 'Ticker : ' + productCode });
        })
        .catch(error => {
            res.render('error', { message: "Error getting ticker for " + productCode, error: error });
        })

});

/**
 * Get the order book for a specific product
 */
router.get('/product-order-book/:product', security.isAuthenticated, function (req, res, next) {
    const productCode = req.params.product;
    const level = 2;

    publicAPI.getProductOrderBook(productCode, level)
        .then(data => {
            res.render('order-book', {
                layout: 'layout-with-graph',
                bids: data.bids,
                asks: data.asks,
                title: 'Order book : ' + productCode
            });
        })
        .catch(error => {
            res.render('error', { message: "Error getting order book for " + productCode, error: error });
        });

});

/**
 * Currencies available on the exchange
 */
router.get('/currencies', security.isAuthenticated, function (req, res, next) {

    publicAPI.getCurrencies()
        .then(data => {
            res.render('currencies', { data: data, title: 'Currencies' });
        })
        .catch(error => {
            res.render('error', { message: "Error getting currencies ", error: error });
        });

});

/**
 * Information about your account
 * Authenticated call
 */
router.get('/accounts', security.isAuthenticated, function (req, res, next) {

    authenticatedAPI.getAccounts()
        .then(data => {
            res.render('accounts', { data: data, title: 'Accounts' });
        })
        .catch(error => {
            res.render('error', { message: "Error accounts ", error: error });
        });

});

/**
 * Historic rates for the specified products
 */
router.get('/history/:product', security.isAuthenticated, function (req, res, next) {
    const productCode = req.params.product;

    publicAPI.getProductHistory(productCode, 900)
        .then(data => {
            console.log(data);
            res.render('history', { data: data, title: 'History : ' + productCode });
        })
        .catch(error => {
            res.render('error', { message: "History for " + productCode, error: error });
        })
});

/**
 * Information about your open orders
 * Authenticated call
 */
router.get('/orders/:productCode?', security.isAuthenticated, function (req, res, next) {
    const productCode = req.params.productCode;

    authenticatedAPI.getOrders( productCode )
        .then(data => {
            console.log(data);
            res.render('orders', { data: data, title: 'My Orders' });
        })
        .catch(error => {
            res.render('error', { message: "Error orders ", error: error });
        });

});

/**
 * Information about recently filled orders
 * Authenticated call
 */
router.get('/fills/:product?', security.isAuthenticated, function (req, res, next) {
    const productCode = req.params.product;

    authenticatedAPI.getFills( productCode )
        .then(data => {
            res.render('fills', { data: data, title: 'Fills' });
        })
        .catch(error => {
            res.render('error', { message: "Error fills ", error: error });
        });

});

/**
 * Information about recently filled orders
 * Authenticated call
 */
router.get('/trades/:product', security.isAuthenticated, function (req, res, next) {
    const productCode = req.params.product;

    authenticatedAPI.getTrades( productCode )
        .then(data => {
            console.log(data);
            res.render('trades', { data: data, title: 'Trades' });
        })
        .catch(error => {
            res.render('error', { message: "Error trades ", error: error });
        });

});

module.exports = router;