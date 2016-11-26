define([
  "luciad/shape/ShapeFactory",
  "luciad/model/feature/Feature",
  "luciad/model/store/MemoryStore",
  "luciad/model/feature/FeatureModel"
], function(ShapeFactory, Feature, MemoryStore, FeatureModel) {

  /**
   * A FeatureModel that contains features with Bounds geometry that represent histogram buckets.
   *
   * The bucket's height indicates the content of the bucket, and is always equalized to the given max value.
   *
   * You should not populate (add/put/remove) this histogram yourself, instead use {@link #updateHistogram} to refresh the buckets.
   *
   * @param reference The reference the buckets will be in, for example X is time and Y is bucket content size
   * @param start The start of the bucket range
   * @param end The end of the bucket range
   * @param count The number of buckets
   * @param equalizeMax All buckets will be rescaled to this max value
   */

  function Histogram(reference, start, end, count, equalizeMax) {
    FeatureModel.call(this, new MemoryStore(), {reference: reference});

    this._reference = reference;
    this._start = start;
    this._end = end;
    this._step = (end - start) / count;
    this._equalizeMax = equalizeMax;
    this._buckets = [];

    for (var i = 0; i < count; i++) {
      var x = this._start + (i * this._step);
      var w = this._step;
      var feature = new Feature(ShapeFactory.createBounds(reference, [x, w, 0, 0]), {}, i);
      this._buckets[i] = feature;
      this.put(feature);
    }
  }

  Histogram.prototype = Object.create(FeatureModel.prototype);
  Histogram.prototype.constructor = Histogram;

  /**
   * Updates the histogram.  The caller must pass a function to do the updates.
   * That function gets an "accumulate" function that the caller can invoke with x and y values.
   */
  Histogram.prototype.updateHistogram = function(updater) {
    for (var i = 0; i < this._buckets.length; i++) {
      var bucket = this._buckets[i];
      bucket.properties.previousHeight = bucket.shape.height;
      bucket.shape.height = 0;
    }

    var self = this;
    updater(function(x, y) {
      var i = Math.floor((x - self._start) / self._step);
      var bucket = self._buckets[i];
      bucket.shape.height += y;
    });

    var max = 0;
    for (var i = 0; i < this._buckets.length; i++) {
      var bucket = this._buckets[i];
      max = Math.max(bucket.shape.height, max);
    }
    for (var i = 0; i < this._buckets.length; i++) {
      var bucket = this._buckets[i];
      bucket.shape.height = this._equalizeMax * (bucket.shape.height / max);
      if (bucket.properties.previousHeight !== bucket.shape.height) {
        this.put(bucket);
      }
    }
  }

  return Histogram;
});
