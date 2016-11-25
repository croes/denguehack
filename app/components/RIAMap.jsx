import React from 'react';
import WebGLMap from "luciad/view/WebGLMap";
import LonLatGrid from "luciad/view/grid/LonLatGrid";
import GridLayer from "luciad/view/grid/GridLayer";
import MemoryStore from "luciad/model/store/MemoryStore";
import FeatureModel from "luciad/model/feature/FeatureModel";
import FeatureLayer from "luciad/view/feature/FeatureLayer";
import ReferenceProvider from "luciad/reference/ReferenceProvider";
import ShapeFactory from "luciad/shape/ShapeFactory";
import Feature from "luciad/model/feature/Feature";
import LonLatPointFormat from "luciad/shape/format/LonLatPointFormat";

export default class RIAMap extends React.Component {

  _map;

  componentDidMount() {
    this._map = new WebGLMap(this.refs.riamap, { reference: ReferenceProvider.getReference("EPSG:4978")});
    let llhRef = ReferenceProvider.getReference("EPSG:4326");
    let store = new MemoryStore();
    let model = new FeatureModel(store, {
      reference: llhRef
    });
    let featureLayer = new FeatureLayer(model);
    let shape = ShapeFactory.createBounds( llhRef, [-180, 360, -90, 180]);
    let feature = new Feature(shape, {});
    model.put( feature );
    this._map.layerTree.addChild(featureLayer);

    let settings = [];
    settings.push( {scale: 2.0E-8 * 4, deltaLon:  1, deltaLat:  1 });
    settings.push( {scale: 2.0E-8    , deltaLon:  5, deltaLat:  5 });
    settings.push( {scale: 9.0E-9    , deltaLon: 10, deltaLat: 10 });
    settings.push( {scale: 5.0E-9    , deltaLon: 20, deltaLat: 20 });
    settings.push( {scale: 0         , deltaLon: 45, deltaLat: 45 });
    let grid = new LonLatGrid(settings);
    //Set the default styling for grid lines and labels
    grid.fallbackStyle = {
      labelFormat: new LonLatPointFormat({pattern: "lat(+DM),lon(+DM)"}),
      originLabelFormat: new LonLatPointFormat({pattern: "lat(+D),lon(+D)"}),
      originLineStyle: {
        color: "rgba(230, 20, 20, 0.6)",
        width: 2
      },
      lineStyle: {
        color: "rgba(210,210,210,0.6)",
        width: 1
      },
      originLabelStyle: {
        fill: "rgba(210,210,210,0.8)",
        halo: "rgba(230, 20, 20, 0.8)",
        haloWidth: "3",
        font: "12px sans-serif"
      },
      labelStyle: {
        fill: "rgb(220,220,220)",
        halo: "rgb(102,102,102)",
        haloWidth: "3",
        font: "12px sans-serif"
      }
    };
    let gridLayer = new GridLayer(grid);
    this._map.layerTree.addChild(gridLayer);
  }

  componentWillUnmount() {
    if (this._map) {
      this._map.destroy();
    }
  }

  render() {
    return (
        <div ref="riamap" style={{width: "100%", height: "100%"}}>
        </div>
    )
  }
}