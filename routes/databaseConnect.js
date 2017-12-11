var pg = require('pg');

var connection = function (){
    var client = new pg.Client('postgres://postgres:postgres@127.0.0.1:5432/test');
    client.connect();
    return client;
};

module.exports = connection;