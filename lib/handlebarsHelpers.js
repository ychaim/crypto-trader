'use strict';

var Handlebars = require('express-handlebars');

/**
 * Helper functions for Handlebars
 */
exports.parse_zulu = function (zulu_date) {
    const dateTime = new Date(Date.parse(zulu_date));
    return dateTime.toUTCString();
};

exports.parse_time = function (timestamp) {
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    const date = new Date(timestamp * 1000);
    return date.toUTCString();
};

exports.to_fixed = function (numberStr, numDecimalPlaces) {
    let result = parseFloat(numberStr);
    if (isNaN(result)) {
        return "";
    }
    else {
        return result.toFixed(numDecimalPlaces)
    }
}

exports.extract_market = function(market , position) {
    let parts = market.split("-");
    return parts[position-1];
}

exports.nl2br = function (text, isXhtml) {
    var breakTag = (isXhtml || typeof isXhtml === 'undefined') ? '<br />' : '<br>';
    return (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
};
