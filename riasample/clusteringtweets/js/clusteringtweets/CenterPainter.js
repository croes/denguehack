define([
    "luciad/util/IconFactory",
    "luciad/view/feature/FeaturePainter"
], function(IconFactory, FeaturePainter) {

    function CenterPainter() {
        this._iconCache = {};
    }

    CenterPainter.prototype = new FeaturePainter();
    CenterPainter.prototype.constructor = CenterPainter;

    var MAX_WEIGHT = 2;

    CenterPainter.prototype.paintBody = function(geoCanvas, feature, shape, layer, map, state) {


        var normalizedWeightFraction = feature.properties.weight / MAX_WEIGHT;
        var colorComponentWeight = Math.round(normalizedWeightFraction * 255);
        var weightColor = "rgba(" + colorComponentWeight + "," + colorComponentWeight + "," + colorComponentWeight + ", 1.0)";

        var dimension = 30 + (normalizedWeightFraction * 30);
        var cacheKey = "" + weightColor + dimension;
        var icon = this._iconCache[cacheKey];
        var black = "rgba(0,0,0,1.0)";
        if (!icon) {
            icon = this._iconCache[cacheKey] = IconFactory.circle({stroke: black, strokeWidth: 3, fill: weightColor, width: dimension, height: dimension});
        }

        geoCanvas.drawIcon(shape.focusPoint,
            {
                width: dimension + "px",
                height: dimension + "px",
                image: icon
            }
        );
    };

    return CenterPainter;
});
