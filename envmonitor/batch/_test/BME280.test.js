const BME280 = require('../BME280.js');

const envSensor = new BME280();
if (envSensor.open()) {
	console.log(envSensor.getData());
	envSensor.close();
} else {
	console.log('Unable to open I2C');
}
