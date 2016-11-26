define([
    "luciad/util/IconFactory",
    "luciad/view/feature/FeaturePainter",
    "luciad/shape/ShapeFactory"
], function(IconFactory, FeaturePainter, ShapeFactory) {

    function TweetsPainter(timeslider, centerLayer) {
        this._iconCache = {};
        this._timeslider = timeslider;
        this._centerLayer = centerLayer;
    }

    TweetsPainter.prototype = new FeaturePainter();
    TweetsPainter.prototype.constructor = TweetsPainter;

    var TIME_DISTANCE = 60*60*24*5; //fade out completely if further than 5 days away from currentTime

    TweetsPainter.prototype.paintBody = function(geoCanvas, feature, shape, layer, map, state) {

        var dimension;
        var icon;
        if (feature.properties.assigned_to_cluster === "NA") { //If NA, draw with small black rect
            var black = "rgba(0,0,0,1.0)";
            var dimension = 5;
            icon = this._iconCache[cacheKey];
            if (!icon) {
                icon = this._iconCache[cacheKey] = IconFactory.rectangle({stroke: black, fill: black, width: dimension, height: dimension});
            }

            geoCanvas.drawIcon(shape.focusPoint,
                {
                    width: dimension + "px",
                    height: dimension + "px",
                    image: icon
                }
            );
            return;
        }

        var absDistanceToCurrentTime = Math.abs(getTweetEventTime(feature.properties.timestamp) - this._timeslider.getCurrentTime());
        var alpha = Math.min(1.0, Math.max(0.0, 1.0 - (absDistanceToCurrentTime / TIME_DISTANCE)));
        var tweetColor =  "rgba(0, 0, 255," + alpha + ")";
        dimension = 8;
        var cacheKey = "" + tweetColor ;
        var icon = this._iconCache[cacheKey];
        if (!icon) {
            icon = this._iconCache[cacheKey] = IconFactory.rectangle({stroke: tweetColor, fill: tweetColor, width: dimension, height: dimension});
        }

        geoCanvas.drawIcon(shape.focusPoint,
            {
                width: dimension + "px",
                height: dimension + "px",
                image: icon
            }
        );

        var lineStyle = {
            color: "rgba(255,0,0," + alpha + ")",
            width: 3
        };

        var lineShapeStyle = {
            stroke: lineStyle,
            draped: true
        };

        //draw a line from the tweet to the cluster center
        var center = this.findCenter(feature.properties.assigned_to_cluster);
        if (center) {
            var line = ShapeFactory.createPolyline(shape.reference, [shape.focusPoint, center.shape.focusPoint]);

            geoCanvas.drawShape(line, lineShapeStyle);
        }

    };

    function getTweetEventTime(timestamp) {
        var dateString = timestamp;
        return Date.parse(dateString) / 1000;
    }

    TweetsPainter.prototype.findCenter = function(centerId) {
        if (this._centerLayer) {
            var workingSet = this._centerLayer.workingSet.get();
            for(var i = 0; i < workingSet.length; i++) {
                if (workingSet[i].id === centerId) {
                    return workingSet[i];
                }
            }
        }
        return null;
    };

    return TweetsPainter;
});
