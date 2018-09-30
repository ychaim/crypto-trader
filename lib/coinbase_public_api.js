"use strict";

const debug = require('debug')('trader:coinbase:public');
const request = require('request');


/**
 * Interface to the public API of CoinBase
 */
class CoinBasePublic {

    constructor (baseAPIURL) {
        this.apiURL = baseAPIURL;
    }

    /**
     * Get the products
     *
     * GET /products
     *
     * @returns {Promise<any>}
     */
    getProducts() {
        return this.callPublicEndpoint( '/products' );
    }

    /**
     * Get the known currencies
     *
     * GET /currencies
     *
     * @returns {Promise<any>}
     */
    getCurrencies( ){
        return this.callPublicEndpoint( '/currencies' );
    }

    /**
     *
     * Snapshot information about the last trade (tick), best bid/ask and 24h volume.
     *
     * GET /products/<product-id>/ticker
     *
     * @param product_id
     * @returns {Promise<any>}
     */
    getProductTicker( product_id ){
        return this.callPublicEndpoint( '/products/' + product_id + '/ticker' );
    }

    /**
     * By default, only the inside (i.e. best) bid and ask are returned. This is equivalent to a book depth of 1 level.
     * If you would like to see a larger order book, specify the level query parameter.
     * If a level is not aggregated, then all of the orders at each price will be returned.
     * Aggregated levels return only one size for each active price
     * (as if there was only a single order for that size at the level).
     *
     * GET /products/<product-id>/book
     *
     * @param product_id
     * @param level
     * @returns {Promise<any>}
     */
    getProductOrderBook( product_id, level ) {
        return this.callPublicEndpoint( '/products/' + product_id + '/book', { 'level': level });
    }


    /**
     * Historic rates for a product. Rates are returned in grouped buckets based on requested granularity.
     *
     * GET /products/<product-id>/candles
     *
     * @param product_id
     * @param granularity
     * @returns {Promise<any>}
     */
    getProductHistory( product_id, granularity ) {
        return this.callPublicEndpoint( '/products/' + product_id + '/candles', {"granularity" : granularity});
    }


    /**
     * Helper function to perform GET queries against the Coin Base API
     *
     * @param endpoint
     * @returns {Promise<any>}
     */
    callPublicEndpoint(endpoint, parameters = {} ) {
        debug('Calling: %s' , endpoint);

        const options = {
            url: this.apiURL +  endpoint,
            qs: parameters,
            headers: {
                'User-Agent': 'request'
            }
        };

        // Return a promise
        return new Promise(function(resolve, reject) {
            // Do async job
            request.get(options, function(err, resp, body) {
                if (err) {
                    reject(err);
                } else {
                    resolve(JSON.parse(body));
                }
            })
        })
    }
}


module.exports = CoinBasePublic;



