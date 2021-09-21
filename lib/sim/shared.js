"use strict";

exports.__esModule = true
function isPlayable(shipid) {
	return (shipid < 1500 || (shipid >= 9001 && shipid <= 9003));
}
exports.isPlayable = isPlayable
