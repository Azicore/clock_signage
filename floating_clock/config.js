// FloatingClockの設定
const config = {};
config.charWidth       = 80;
config.charHeight      = config.charWidth * 1.5;
config.lineWidth       = config.charWidth * 0.2;
config.charMargin      = config.lineWidth * 2.5;
config.colonPosition   = (config.charHeight - config.lineWidth) * 0.25;
config.scale           = 1;
config.backgroundColor = '#000000';
config.clockColor      = '#ffffff';
config.roundedLine     = true;
config.easePower       = 5;
config.moveSpeed       = 40;

export { config };
