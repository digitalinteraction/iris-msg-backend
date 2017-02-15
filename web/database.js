/*jshint esversion: 6 */


// Imports
const _ = require('lodash');
const Waterline = require('waterline');
const mysqlAdapter = require('sails-mysql');




// Database Config
const dbConfig = {
    
    adapters: {
        'default': mysqlAdapter,
        mysql: mysqlAdapter
    },
    
    connections: {
        
        mysqlAdapter: {
            adapter: 'mysql',
            url: process.env.SQL_URL,
        }
    },
      
    defaults: {
        migrate: 'alter'
    }
};



function registerModels(object, orm) {
    
    for (var key in object) {
        
        orm.loadCollection(object[key]);
    }
}



module.exports = new Promise(function(resolve, reject) {
    
    
    var org = require('./models/organisation.model.js');
    
    
    // Setup the orm
    var orm = new Waterline();
    
    
    //  Load our models
    registerModels(require('./models'), orm);
    
    
    // initialize the orm
    orm.initialize(dbConfig, function(error, models) {
        
        if(error) {
            reject(error);
        }
        
        resolve({
            orm: orm,
            models: models.collections,
            connections: models.connections
        });
    });
    
    
    
    // console.log('connecting to db ... ');
    // resolve();
});
