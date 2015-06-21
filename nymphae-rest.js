var restify = require('restify');  
var server = restify.createServer();
server.use(restify.bodyParser());

var mongoose = require('mongoose/');
var config = require('./config');
db = mongoose.connect(config.db.test || process.env.MONGO_URL),
Schema = mongoose.Schema;

// Create a schema for our data
var MacAddressesSchema = new Schema({
  macAddress: String,
  firstTime: Boolean
});
// Use the schema to register a model with MongoDb
mongoose.model('MacAddresses', MacAddressesSchema); 
var MacAddresses = mongoose.model('MacAddresses');


function putMacAddresses(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	
	MacAddresses.findOneAndUpdate(
		{macAddress: req.params.macAddress},  //query 
		{macAddress: req.params.macAddress, firstTime: true},  //update 
		{ upsert: true},  //create if it doesn't exist 
		function(err, doc){
			if (err) {
				return res.send(500, { error: err });
			}
			if (doc) {
				return res.send(200);
			} else {
				return res.send(201);
			}
		}
	);
	
	
}

if(!process.env.MONGO_URL){
	server.listen(8080, function() {
	  console.log('%s listening at %s', server.name, server.url);
	});
}


// Set up our routes and start the server
server.put('/macaddresses', putMacAddresses);