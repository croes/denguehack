define([
  'luciad/util/Promise'
], function(Promise) {

  var SVGUtil = {};

  /**
   * Loads an SVG from the given URL as text.
   * @return {Promise for Node} Returns a promise for a SVG DOM node (unattached).
   */
  SVGUtil.loadSVGText = function(svgUrl) {
    return new Promise(function(resolve, reject){
      var xhr = new XMLHttpRequest();
      xhr.onload = function() {
        var content = this.responseText;
        resolve(content);
      };
      xhr.onerror = reject;
      xhr.open("GET", svgUrl);
      xhr.send();
    });
  };

  /**
   * Loads an SVG from the given URL and return it as a DOM node.
   * @return {Promise for Node} Returns a promise for a SVG DOM node (unattached).
   */
  SVGUtil.loadSVGNode = function(svgUrl) {
    return SVGUtil.loadSVGText(svgUrl).then(function(svgText) {
      var container = document.createElement("div");
      container.innerHTML = svgText;
      return container.firstChild;
    });
  };

  return SVGUtil;

});