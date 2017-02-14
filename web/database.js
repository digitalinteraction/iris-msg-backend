/*jshint esversion: 6 */


// Imports
const Waterline = require('waterline');
const mysqlAdapter = require('sails-mysql');



// Database Config
const dbConfig = {
    
    adapters: {
        'default': mysqlAdapter,
        mysql: mysqlAdapter
    },
    
    connections: {
        myLocalDisk: {
          adapter: 'disk'
        },
        
        myLocalMySql: {
            adapter: 'mysql',
            url: process.env.SQL_URL,
        }
    },
      
    defaults: {
        migrate: 'alter'
    }
};



module.exports = new Promise(function(resolve, reject) {
    
    // Setup the orm
    // const orm = new Waterline();
    
    //  Load our modules
    // const models = require('./models');
    
    // console.log('A');
    // console.log(models);
    
    console.log('connecting to db ... ');
    resolve();
});
