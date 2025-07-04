// PhotoSlideshowの設定
const config = {
	common: {
		perspectiveRatio: 2,
		depthRatio: 4
	},
	position: {
		minAppearanceRotation: 180,
		maxAppearanceRotation: 720,
		minDisplayRotation: 5,
		maxDisplayRotation: 10,
		exclusionRadiusRatio: 0.2
	},
	display: {
		elementWidthRatio: 3,
		elementHeightRatio: 1,
		movingTime: 1600,
		displayingTime: 3000
	},
	file: {
		directory: './sample_images',
		manualMode: false,
		maxTrial: 2
	}
};

export { config };
