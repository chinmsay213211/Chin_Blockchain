const pg = require('pg'),
    config = require('config');

// create a config to configure both pooling behavior
// and client options
// note: all config is optional and the environment variables
// will be read if the config is not present
const pg_config = {
    user: config.pg_user, //env var: PGUSER
    database: config.pg_database, //env var: PGDATABASE
    password: config.pg_password, //env var: PGPASSWORD
    host: config.pg_host, // Server hosting the postgres database
    port: config.pg_port, //env var: PGPORT
    max: config.pg_max, // max number of clients in the pool
    idleTimeoutMillis: config.pg_idleTimeoutMillis
};

//this initializes a connection pool
//it will keep idle connections open for 30 seconds
//and set a limit of maximum 10 idle clients
const pool = new pg.Pool(pg_config);

pool.on('error', function (err, client) {
    // if an error is encountered by a client while it sits idle in the pool
    // the pool itself will emit an error event with both the error and
    // the client which emitted the original error
    // this is a rare occurrence but can happen if there is a network partition
    // between your application and the database, the database restarts, etc.
    // and so you might want to handle it and at least log it out
    console.error('idle client error', err.message, err.stack);
});

//export the query method for passing queries to the pool
module.exports.query = function (text, values, callback) {
    console.log('query:', text, values);
    return pool.query(text, values, callback);
};

// the pool also supports checking out a client for
// multiple operations, such as a transaction
module.exports.connect = function (callback) {
    return pool.connect(callback);
};