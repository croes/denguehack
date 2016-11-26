define([
  "luciad/util/IconFactory",
  "luciad/view/feature/FeaturePainter"
], function(IconFactory, FeaturePainter) {

  /**
   * FeaturePainter that displays dot icons with a color and size based on properties in the GML file:
   * <ul>
   *   <li>The "Magnitude" property determines the dot size: larger dots for stronger quakes</li>
   *   <li>The "Depth" property determines the dot color: superficial quakes are red, deep quakes are yellow to blue</li>
   * </ul>
   */
  function EarthquakesPainter() {
    this._iconCache = {};
  }

  EarthquakesPainter.prototype = new FeaturePainter();
  EarthquakesPainter.prototype.constructor = EarthquakesPainter;

  EarthquakesPainter.prototype.paintBody = function(geoCanvas, feature, shape, layer, map, state) {

    function getEarthquakeColor(depth) {
      if (depth < 10) {
        return "rgba(177, 0, 38, 0.7)";
      } else if (depth < 25) {
        return "rgba(227, 27, 28, 0.7)";
      } else if (depth < 50) {
        return "rgba(252, 78, 42, 0.7)";
      } else if (depth < 100) {
        return "rgba(253, 141, 60, 0.7)";
      } else if (depth < 250) {
        return "rgba(254, 178, 76, 0.7)";
      } else if (depth < 400) {
        return "rgba(224, 217, 118, 0.7)";
      } else if (depth < 500) {
        return "rgba(200, 237, 160, 0.7)";
      } else {
        return "rgba(170, 255, 204, 0.7)";
      }
    }

    var dimension = Math.pow(1.5, Math.round(feature.properties.Magnitude));
    var outlineColor = "rgba(255,255,255,1)";
    var fillColor = state.selected ? "rgba(192, 217, 42, 1)" : getEarthquakeColor(feature.properties.Depth);
    var cacheKey = "" + dimension + outlineColor + fillColor;
    var icon = this._iconCache[cacheKey];
    if (!icon) {
      icon = this._iconCache[cacheKey] = IconFactory.circle({stroke: outlineColor, fill: fillColor, width: dimension, height: dimension});
    }

    geoCanvas.drawIcon(shape.focusPoint,
        {
          width: dimension + "px",
          height: dimension + "px",
          image: icon
        }
    );
  };

  return EarthquakesPainter;
});
