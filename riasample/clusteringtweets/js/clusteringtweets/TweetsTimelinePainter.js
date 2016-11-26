define([
    "luciad/util/IconFactory",
    "luciad/view/feature/FeaturePainter",
    "luciad/shape/ShapeFactory"
], function (IconFactory, FeaturePainter, ShapeFactory) {

    function TweetsTimelinePainter() {
        this._iconCache = {};
    }

    TweetsTimelinePainter.prototype = new FeaturePainter();
    TweetsTimelinePainter.prototype.constructor = TweetsTimelinePainter;

    TweetsTimelinePainter.prototype.paintBody = function (geoCanvas, feature, shape, layer, map, state) {

        var color = "rgba(127,255,0,0.1)";
        var width = 10;
        var height = 2 * width;
        var cacheKey = "" + color + width + height;
        var icon = this._iconCache[cacheKey];
        if (!icon) {
            icon = this._iconCache[cacheKey] = IconFactory.rectangle({
                stroke: color,
                fill: color,
                width: width,
                height: height
            });
        }

        geoCanvas.drawIcon(shape.focusPoint,
            {
                width: width + "px",
                height: height + "px",
                image: icon
            }
        );
    };


    return TweetsTimelinePainter;
});
