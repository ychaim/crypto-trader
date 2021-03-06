"use strict";

const debug = require('debug')('trader:coinbase:authenticated');
const request = require('request');
const querystring = require('querystring');
const crypto = require('crypto');

/**
 * Authenticated requests to the Coin Base APi
 *
 * All REST requests must contain the following headers:
 *
 * CB-ACCESS-KEY The api key as a string.
 * CB-ACCESS-SIGN The base64-encoded signature (see Signing a Message).
 * CB-ACCESS-TIMESTAMP A timestamp for your request.
 * CB-ACCESS-PASSPHRASE The passphrase you specified when creating the API key.
 *
 * All request bodies should have content type application/json and be valid JSON.
 *
 * The CB-ACCESS-SIGN header is generated by creating a sha256 HMAC using the base64-decoded
 * secret key on the prehash string timestamp + method + requestPath + body
 * (where + represents string concatenation) and base64-encode the output.
 *
 * The timestamp value is the same as the CB-ACCESS-TIMESTAMP header.
 */
class CoinBaseAuthenticated {

    constructor (baseAPIUrl, key, secret, passPhrase) {
        this.key = key;
        this.secret = secret;
        this.passPhrase = passPhrase;
        this.apiUrl = baseAPIUrl;
    }

    /**
     * Return the current status of the users accounts
     *
     * GET /accounts
     *
     * @returns {Promise<any>}
     */
    getAccounts () {
        return this.callAuthenticatedEndpoint('/accounts');
    }

    /**
     * List your current open orders. Only open or un-settled orders are returned.
     * As soon as an order is no longer open and settled, it will no longer appear in the default request.
     *
     * GET /orders
     *
     * @returns {Promise<any>}
     */
    getOrders (productCode) {
        if( productCode ) {
            return this.callAuthenticatedEndpoint('/orders',
                {
                    "product_id": productCode,
                    "status" : "done"
                });
        } else
            return this.callAuthenticatedEndpoint('/orders', { "status": "done" });
    }

    /**
     * List filled orders
     *
     * GET /fills
     *
     * @param productCode
     * @returns {Promise<any>}
     */
    getFills (productCode) {
        return this.callAuthenticatedEndpoint('/fills', { "product_id": productCode });

    }


    /**
     * Get the most recent trades for a product
     *
     * GET /products/<product-id>/trades
     *
     * @param product_id
     * @returns {Promise<any>}
     */
    getTrades( product_id ){
        return this.callAuthenticatedEndpoint( '/product/' + product_id + '/trades');
    }

    /**
     * Helper function to perform GET queries against the Coin Base API
     *
     * @param endpoint
     * @returns {Promise<any>}
     */
    callAuthenticatedEndpoint (endpoint, parameters = {}) {
        debug('Calling: %s', endpoint);

        const timestamp = Date.now() / 1000;
        let body = '';

        if (parameters && Object.keys(parameters).length !== 0) {
            body = '?' + querystring.stringify(parameters);
        }

        const options = {
            url: this.apiUrl + endpoint,
            qs: parameters,
            headers: {
                'User-Agent': 'request',
                'CB-ACCESS-KEY': this.key,
                'CB-ACCESS-SIGN': getMessageSignature(endpoint, this.secret, timestamp, 'GET', body),
                'CB-ACCESS-TIMESTAMP': timestamp,
                'CB-ACCESS-PASSPHRASE': this.passPhrase
            }
        };

        //debug(options);

        // Return a promise
        return new Promise(function (resolve, reject) {
            // Do async job
            request.get(options, function (err, resp, body) {
                if (err) {
                    reject(err);
                } else {
                    resolve(JSON.parse(body));
                }
            })
        })
    }

}

module.exports = CoinBaseAuthenticated;

/**
 * Generate the CB-ACCESS-SIGN message signature
 *
 * @returns {string}
 */
function getMessageSignature (requestPath, secret, timestamp, method, body) {

    // create the prehash string by concatenating required parts
    const what = timestamp + method + requestPath + body;

    // decode the base64 secret
    const key = Buffer(secret, 'base64');

    // create a sha256 hmac with the secret
    const hmac = crypto.createHmac('sha256', key);

    // sign the require message with the hmac
    // and finally base64 encode the result
    return hmac.update(what).digest('base64');
}