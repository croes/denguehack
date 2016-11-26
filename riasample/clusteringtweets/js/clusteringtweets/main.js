define([
  "samples/layertreecontrol2/HTML5LayerTreeControl",
  "samples/common/LayerConfigUtil",
  "luciad/transformation/TransformationFactory",
  "luciad/view/feature/ShapeProvider",
  "luciad/shape/ShapeFactory",
  "samples/timeslider/TimeSlider",
  "./EarthquakesPainter",
  "./Histogram",
  "luciad/model/feature/Feature",
  "luciad/view/feature/FeaturePainter",
  "luciad/model/store/UrlStore",
  "luciad/model/codec/GMLCodec",
  "luciad/view/feature/FeatureLayer",
  "luciad/reference/ReferenceProvider",
  "luciad/model/feature/FeatureModel",
  "template/sample",
    "./CenterPainter",
    "./TweetsPainter",
    "./TweetsTimelinePainter",
    "luciad/view/LayerGroup",
  "template/sampleReady!"
], function(HTML5LayerTreeControl, LayerConfigUtil, TransformationFactory, ShapeProvider, ShapeFactory, TimeSlider,
            EarthquakesPainter, Histogram, Feature, FeaturePainter, UrlStore, GMLCodec,
            FeatureLayer, ReferenceProvider, FeatureModel, sample, CenterPainter, TweetsPainter, TweetsTimelinePainter, LayerGroup) {

  var map = sample.makeMap({}, {includeLayerControl: false});

  var gridLayer = LayerConfigUtil.createLonLatGridLayer();
  map.layerTree.addChild(gridLayer);

  var startTime = new Date(2016, 7, 16).getTime() / 1000;
  var endTime = new Date(2016, 10, 21).getTime() / 1000;

  var timeSlider = new TimeSlider("timeslider");
  timeSlider.setValidRange(startTime, endTime, 0, 1000);

  // var histogram = new Histogram(TimeSlider.REFERENCE, startTime, endTime, 12 * 12, 800);

  function getTweetEventTime(tweet) {
    var dateString = tweet.properties.timestamp;
    return Date.parse(dateString) / 1000;
  }

  // var centerModel1 = createCenterModel(require.toUrl("./data/geojson/1_centers.geojson"));
  // var centerLayer1 = createCenterLayer(centerModel1, "Centers1");
  var centerModel2 = createCenterModel(require.toUrl("./data/geojson/2_centers.geojson"));
  var centerLayer2 = createCenterLayer(centerModel2, "Centers2");
  var centerModel3 = createCenterModel(require.toUrl("./data/geojson/3_centers.geojson"));
  var centerLayer3 = createCenterLayer(centerModel3, "Centers3");
  var centerModel4 = createCenterModel(require.toUrl("./data/geojson/4_centers.geojson"));
  var centerLayer4 = createCenterLayer(centerModel4, "Centers4");
  var centerModel5 = createCenterModel(require.toUrl("./data/geojson/5_centers.geojson"));
  var centerLayer5 = createCenterLayer(centerModel5, "Centers5");
  var centerModel6 = createCenterModel(require.toUrl("./data/geojson/6_centers.geojson"));
  var centerLayer6 = createCenterLayer(centerModel5, "Centers6");
  var centerModel7 = createCenterModel(require.toUrl("./data/geojson/7_centers.geojson"));
  var centerLayer7 = createCenterLayer(centerModel5, "Centers7");
  var centerModel8 = createCenterModel(require.toUrl("./data/geojson/8_centers.geojson"));
  var centerLayer8 = createCenterLayer(centerModel5, "Centers8");

  var centerModel9 = createCenterModel(require.toUrl("./data/geojson/9_centers.geojson"));
  var centerLayer9 = createCenterLayer(centerModel5, "Centers9");
  var centerModel10 = createCenterModel(require.toUrl("./data/geojson/10_centers.geojson"));
  var centerLayer10 = createCenterLayer(centerModel5, "Centers10");
  var centerModel11 = createCenterModel(require.toUrl("./data/geojson/11_centers.geojson"));
  var centerLayer11 = createCenterLayer(centerModel5, "Centers11");

  var centerLayerGroup = new LayerGroup({
    label: "Cluster centers"
  });

  // var tweetsModel1 = createTweetsModel(require.toUrl("./data/geojson/1_tweets.geojson"));
  // var tweetsLayer1 = createTweetsLayer(tweetsModel1, "Tweets1", centerLayer1);
  var tweetsModel2 = createTweetsModel(require.toUrl("./data/geojson/2_tweets.geojson"));
  var tweetsLayer2 = createTweetsLayer(tweetsModel2, "Tweets2"), centerLayer2;
  var tweetsModel3 = createTweetsModel(require.toUrl("./data/geojson/3_tweets.geojson"));
  var tweetsLayer3 = createTweetsLayer(tweetsModel3, "Tweets3", centerLayer3);
  var tweetsModel4 = createTweetsModel(require.toUrl("./data/geojson/4_tweets.geojson"));
  var tweetsLayer4 = createTweetsLayer(tweetsModel4, "Tweets4", centerLayer4);
  var tweetsModel5 = createTweetsModel(require.toUrl("./data/geojson/5_tweets.geojson"));
  var tweetsLayer5 = createTweetsLayer(tweetsModel5, "Tweets5", centerLayer5);
  var tweetsModel6 = createTweetsModel(require.toUrl("./data/geojson/6_tweets.geojson"));
  var tweetsLayer6 = createTweetsLayer(tweetsModel5, "Tweets5", centerLayer6);
  var tweetsModel7 = createTweetsModel(require.toUrl("./data/geojson/7_tweets.geojson"));
  var tweetsLayer7 = createTweetsLayer(tweetsModel5, "Tweets5", centerLayer7);
  var tweetsModel8 = createTweetsModel(require.toUrl("./data/geojson/8_tweets.geojson"));
  var tweetsLayer8 = createTweetsLayer(tweetsModel5, "Tweets5", centerLayer8);
  var tweetsModel9 = createTweetsModel(require.toUrl("./data/geojson/9_tweets.geojson"));
  var tweetsLayer9 = createTweetsLayer(tweetsModel5, "Tweets5", centerLayer9);
  var tweetsModel10 = createTweetsModel(require.toUrl("./data/geojson/10_tweets.geojson"));
  var tweetsLayer10 = createTweetsLayer(tweetsModel5, "Tweets5", centerLayer10);
  var tweetsModel11 = createTweetsModel(require.toUrl("./data/geojson/11_tweets.geojson"));
  var tweetsLayer11 = createTweetsLayer(tweetsModel5, "Tweets5", centerLayer11);



  var tweetsLayerGroup = new LayerGroup({
    label: "Tweets"
  });

  tweetsLayerGroup.addChild(tweetsLayer11, "top");
  tweetsLayerGroup.addChild(tweetsLayer10, "top");
  tweetsLayerGroup.addChild(tweetsLayer9, "top");
  tweetsLayerGroup.addChild(tweetsLayer8, "top");
  tweetsLayerGroup.addChild(tweetsLayer7, "top");
  tweetsLayerGroup.addChild(tweetsLayer6, "top");
  tweetsLayerGroup.addChild(tweetsLayer5, "top");
  tweetsLayerGroup.addChild(tweetsLayer4, "top");
  tweetsLayerGroup.addChild(tweetsLayer3, "top");
  tweetsLayerGroup.addChild(tweetsLayer2, "top");
  // tweetsLayerGroup.addChild(tweetsLayer1, "top");

  map.layerTree.addChild(tweetsLayerGroup);



  // centerLayerGroup.addChild(centerLayer1);
  centerLayerGroup.addChild(centerLayer2);
  centerLayerGroup.addChild(centerLayer3);
  centerLayerGroup.addChild(centerLayer4);
  centerLayerGroup.addChild(centerLayer5);
  centerLayerGroup.addChild(centerLayer6);
  centerLayerGroup.addChild(centerLayer7);
  centerLayerGroup.addChild(centerLayer8);
  centerLayerGroup.addChild(centerLayer9);
  centerLayerGroup.addChild(centerLayer10);
  centerLayerGroup.addChild(centerLayer11);

  map.layerTree.addChild(centerLayerGroup);

  function createTweetsModel(file) {
    var urlStore = new UrlStore({
      target: file
    });
    var tweetsModel = new FeatureModel(urlStore);
    return tweetsModel;
  }

  function tweetsTimeFilter(feature) {
    var visibileTimeRange = timeSlider.mapBounds;
    var centerTime = timeSlider.getCurrentTime();
    var minTime = centerTime - (visibileTimeRange.width / 8);
    var maxTime = centerTime + (visibileTimeRange.width / 8);
    var tweetTime = getTweetEventTime(feature);
    var visible = tweetTime >= minTime && tweetTime <= maxTime;
    // var tweetDate = new Date(tweetTime * 1000);
    // var minDate = new Date(minTime * 1000);
    // var maxDate = new Date(maxTime * 1000);
    // console.log("TweetDate: ", tweetDate, "minDate: ", minDate, "maxDate:", maxDate);
    return visible;
  }


  function createTweetsLayer(model, label, centerLayer) {
    var tweetsLayer = new FeatureLayer(model , {
      label: label
    });
    // tweetsLayer.visibleInTree = false;
    tweetsLayer.filter = tweetsTimeFilter;
    tweetsLayer.painter = new TweetsPainter(timeSlider, centerLayer);
    return tweetsLayer;
  };

  function createCenterModel(file) {
    var urlStore = new UrlStore({
      target: file
    });
    var centerModel = new FeatureModel(urlStore);
    return centerModel;
  }

  function getCenterTimeRange(center) {
    var minDateString = center.properties.clusterStart;
    var maxDateString = center.properties.clusterEnd;
    return {
      min: Date.parse(minDateString) / 1000,
      max: Date.parse(maxDateString) / 1000
    };
  }

  function centerTimeFilter(feature) {
    var visibileTimeRange = timeSlider.mapBounds;
    var centerTime = timeSlider.getCurrentTime();
    var minTime = centerTime - (visibileTimeRange.width / 8);
    var maxTime = centerTime + (visibileTimeRange.width / 8);
    var centerTimeRange = getCenterTimeRange(feature);
    var centerMin = centerTimeRange.min;
    var centerMax = centerTimeRange.max;
    return (centerMin <= maxTime)  &&  (centerMax >= minTime);
  }

  function createCenterLayer(model, label) {
    var centerLayer = new FeatureLayer(model , {
      label: label
    });
    centerLayer.painter = new CenterPainter();
    // centerLayer.visibleInTree = false;
    centerLayer.filter = centerTimeFilter;
    return centerLayer;
  };

  timeSlider.on("MapChange", function() {
    // tweetsLayer1.filter = tweetsTimeFilter;
    tweetsLayer2.filter = tweetsTimeFilter;
    tweetsLayer3.filter = tweetsTimeFilter;
    tweetsLayer4.filter = tweetsTimeFilter;
    tweetsLayer5.filter = tweetsTimeFilter;

    // centerLayer1.filter = centerTimeFilter;
    centerLayer2.filter = centerTimeFilter;
    centerLayer3.filter = centerTimeFilter;
    centerLayer4.filter = centerTimeFilter;
    centerLayer5.filter = centerTimeFilter;

    $("#sliderLabel").text(dateFormat(new Date(timeSlider.getCurrentTime() * 1000)));
  });

  function dateFormat(date) {
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
    return  day + "-" + (monthIndex+1) + "-" + year;
  }

  var layerTreeControl = new HTML5LayerTreeControl(map);

  // createTimeSliderLayerForTweetsModel(tweetsModel1);
  createTimeSliderLayerForTweetsModel(tweetsModel2);
  createTimeSliderLayerForTweetsModel(tweetsModel3);
  createTimeSliderLayerForTweetsModel(tweetsModel4);
  createTimeSliderLayerForTweetsModel(tweetsModel5);

  function createTimeSliderLayerForTweetsModel(tweetsModel) {
    var tweetsOnTimeSliderLayer = new FeatureLayer(tweetsModel);
    var shapeProvider = new ShapeProvider();
    shapeProvider.reference = timeSlider.reference;
    shapeProvider.provideShape = function(feature) {
      return ShapeFactory.createPoint(timeSlider.reference, [getTweetEventTime(feature), 500]);
    };
    tweetsOnTimeSliderLayer.shapeProvider = shapeProvider;
    tweetsOnTimeSliderLayer.painter = new TweetsTimelinePainter();
    timeSlider.layerTree.addChild(tweetsOnTimeSliderLayer);
  }

  var playing = false;
  var lastTimeInMilliseconds = performance.now();
  function step(currentTimeInMilliseconds) {
    if (playing) {
      var deltaRealTime = currentTimeInMilliseconds - lastTimeInMilliseconds;
      var pixelsToPanPerSecond = 50;
      var pixelsToPan = (deltaRealTime  / 1000) * pixelsToPanPerSecond;
      timeSlider.mapNavigator.pan({targetLocation: ShapeFactory.createPoint(null, [timeSlider.viewSize[0] / 2 + pixelsToPan, timeSlider.viewSize[1] / 2])});
      lastTimeInMilliseconds = currentTimeInMilliseconds;
      requestAnimationFrame(step);
    }
  }

  function play() {
    playing = true;
    lastTimeInMilliseconds = performance.now();
    step(lastTimeInMilliseconds);
    $('#playpausebutton').text("Pause");
  }

  function pause() {
    playing = false;
    $('#playpausebutton').text("Play");
  }

  function togglePlayPause() {
    if (playing) { pause(); }
    else { play(); }
  }
  $('#playpausebutton').click(togglePlayPause);
});
