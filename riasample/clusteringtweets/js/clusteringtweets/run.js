require({
  baseUrl: "../..",
  packages: [
    {name: "dojo", location: "./dojo"},
    {name: "dojox", location: "./dojox"},
    {name: "dijit", location: "./dijit"},
    {name: "luciad", location: "./luciad"},
    {name: "template", location: "./samples/resources/template/js"},
    {name: "samplecommon", location: "./samples/common"},
    {name: "samples", location: "./samples"},
    {name: "templates", location: "./samples/resources/template"},
    {name: "navigation", location: "./samples/control/Navigation/js/navigation"},
    {name: "clusteringtweets", location: "./samples/clusteringtweets/js/clusteringtweets"},
    {name: "cop", location: "./samples/cop/js/cop"}
  ],
  cache: {}
}, ["clusteringtweets"]);