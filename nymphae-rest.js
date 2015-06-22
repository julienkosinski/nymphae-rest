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
  firstTime: Boolean,
  type: String,
  idFromMacAddress: String
});
// Use the schema to register a model with MongoDb
mongoose.model('MacAddresses', MacAddressesSchema); 
var MacAddresses = mongoose.model('MacAddresses');

// Create a schema for our data
var SensorsDatasSchema = new Schema({
  datas: Array,
});
// Use the schema to register a model with MongoDb
mongoose.model('SensorsDatas', SensorsDatasSchema); 
var SensorsDatas = mongoose.model('SensorsDatas');


function putMacAddresses(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");

	if(req.params.type == "device" || !req.params.type){
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
	} else if(req.params.type == "capsule") {
		var fromMacAddress = MacAddresses.findOne({ macAddress: req.params.macAddress },
		function (err, doc) {
			if (err) {
				return res.send(500, { error: err });
			} 
		});

		MacAddresses.findOneAndUpdate(
			{macAddress: req.params.macAddress},  //query 
			{macAddress: req.params.macAddress, idFromMacAddress: fromMacAddress._id},  //update 
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
	
}

function putSensorsDatas(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");

	var sensorsDatas = new SensorsDatas();
	sensorsDatas.datas = req.params.datas;
	sensorsDatas.save(function (err, doc) {
		if (err) {
			return res.send(500, { error: err });
		} else {
			return res.send(201);
		}
	});
}

function getLinkedCapsules(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	
	MacAddresses.find(
		{ idFromMacAddress: req.params.device_macaddress },
		function(err, doc) {
			if (err) {
				return res.send(500, { error: err });
			} else {
				return res.send(200, linkedCapsules);
			}
		});

}

if(!process.env.MONGO_URL){
	server.listen(8080, function() {
	  console.log('%s listening at %s', server.name, server.url);
	});
}


// Set up our routes and start the server
server.put('/macaddresses', putMacAddresses);
server.put('/sensorsdatas', putSensorsDatas);
server.get('/linkedcapsules/:device_macaddress', getLinkedCapsules);