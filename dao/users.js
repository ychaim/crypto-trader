const debug = require('debug')('example:users');
const User = require('../models/User');

const default_user  = process.env.DEFAULT_USERNAME || 'admin';
const default_password = process.env.DEFAULT_PASSWORD || 'password';

// Create an example user
let examplePassword = require('crypto').createHash('sha256').update(default_password).digest('base64');
let exampleUser = new User(1, default_user, 'The only user', examplePassword, 'admin', true );

// This is an example implementation - you would normally store users in the DB
const Users = function () {
};


/**
 * Get a user by ID
 * @param id ID of the user to get
 * @param done Function to call with the result
 */
Users.findById = function(id, done) {
    if( id === 1) {
        done( null , exampleUser );
    }
    else {
        done( { message : "No such user" } );
    }
};


/**
 * Get a user by username
 * @param username Username of the user to search for
 * @param done Function to call with the result
 */
Users.findByUsername = function(username, done) {
    if( username === default_user) {
        done(null , exampleUser);
    } else {
        return done( null , null );
    }
};


module.exports = Users;
