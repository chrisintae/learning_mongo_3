var MongoClient = require('mongodb').MongoClient,
    Hapi = require('hapi');

var url = 'mongodb://localhost:27017/learning_mongo'

var server = new Hapi.Server();
server.connection({
    port:8080
})

server.route( [
    // Get tour list
    {
        method: 'GET',
        path: '/api/tours',
        config: {
            json: {
                space:2
            },
            state: {
                parse: false, // parse and store in request.state
                failAction: 'ignore' // may also be 'ignore' or 'log'
            }
        },
        handler: function(request, reply) {
            // query parameters to add search functionality 
            // create a findObject object and scan through the query parameters
            // adding each one to the document to filter with
            var findObject = {};
            
            for (var key in request.query) {
                findObject[key] = request.query[key]
            }
            // pass in findObject
            collection.find(findObject).toArray(function(error, tours) {
                // assert.equal(null,error);
                reply(tours);
            })
        }
    },
    // Add new tour
    {
        method: 'POST',
        path: '/api/tours',
        handler: function(request, reply) {
            // reply ("Adding new tour");

            collection.insertOne(request.payload, function(err, result) {
                // request.payload contains all fields and values sent by client
                reply(request.payload);
            })
        }
    },
    // Get a single tour
    {
        method: 'GET',
        path: '/api/tours/{name}',
        config: {
            json: {
                space:2
            },
            state: {
                parse: false,
                failAction: 'ignore'
            }
        },
        handler: function(request, reply) {
            // reply ("Retrieving " + request.params.name);

            collection.findOne({"tourName":request.params.name}, function(err, tour) {
                reply(tour);
            })
        }
    },
    // Update a single tour
    {
        method: 'PUT',
        path: '/api/tours/{name}',
        handler: function(request, reply) {
            // request.payload variables
            // reply ("Updating " + request.params.name);

            if(request.query.replace == "true") {
                request.payload.tourName = request.params.name;
                collection.replaceOne({"tourName": request.params.name}, request.payload, function(err, result) {
                    collection.findOne({"tourName": request.params.name}, function(err, result) {
                        reply(result);
                    })
                })
            } else {
                collection.updateOne({tourName: request.params.name}, 
                    {$set: request.payload}, function(err, result) {
                        collection.findOne({"tourName": request.params.name}, function(err, result) {
                            reply(result);
                        })
                    }
                )
            }
        }
    },
    // Delete a single tour
    {
        method: 'DELETE',
        path: '/api/tours/{name}',
        handler: function(request, reply) {
            // reply ("Deleting " + request.params.name).code(204);

            collection.deleteOne({tourName:request.params.name},
            function(err, result) {
                reply().code(204); // no content
            })
        }
    },
    // Home page
    {
        method: 'GET',
        path: '/',
        handler: function(request, reply) {
            reply( "Hello world from Hapi/Mongo example.")
        }
    }
])

MongoClient.connect(url, function(err, db) {
    console.log("connected correctly to server");

    collection = db.collection('tours');
    server.start(function(err) {
        console.log('Hapi is listening to http://localhost:8080')
    })
})