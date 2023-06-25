const MH_Z19C = require('../MH_Z19C.js');

(async () => {
	const co2Sensor = new MH_Z19C();
	if (await co2Sensor.open()) {
		try {
			const val = await co2Sensor.getData();
			console.log(`${val} ppm`);
		} catch (e) {
			console.log(`Error: ${e}`);
		}
		await co2Sensor.close();
	} else {
		console.log('Unable to open serial port');
	}
})();
