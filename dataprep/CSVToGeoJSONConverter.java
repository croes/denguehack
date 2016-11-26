package com.mycompany.app;

import com.luciad.datamodel.*;
import com.luciad.format.database.TLcdPrimaryKeyAnnotation;
import com.luciad.format.geojson.TLcdFeatureMetaDataProvider;
import com.luciad.format.geojson.TLcdGeoJsonModelEncoder;
import com.luciad.model.ILcdModel;
import com.luciad.model.TLcd2DBoundsIndexedModel;
import com.luciad.model.TLcdModelDescriptor;
import com.luciad.reference.TLcdGeodeticReference;
import com.luciad.shape.TLcdDataObjectShapeList;
import com.luciad.shape.shape2D.TLcdLonLatPolyline;
import com.mycompany.app.csv.CSVModelDecoder;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;

public class CSVToGeoJSONConverter {

    private static TLcd2DBoundsIndexedModel fCenterModel = new TLcd2DBoundsIndexedModel(new TLcdGeodeticReference(), new TLcdModelDescriptor("DengueHack", "ClusterCenters", "Cluster center"));

    public static void main(String[] args) {
//        addToCenterModel("/home/luciad/projects/denguehack-lightspeed/data/csv/1_centers.csv");
//        addToCenterModel("/home/luciad/projects/denguehack-lightspeed/data/csv/2_centers.csv");
//        addToCenterModel("/home/luciad/projects/denguehack-lightspeed/data/csv/3_centers.csv");
//        addToCenterModel("/home/luciad/projects/denguehack-lightspeed/data/csv/4_centers.csv");
//        addToCenterModel("/home/luciad/projects/denguehack-lightspeed/data/csv/5_centers.csv");
//        addToCenterModel("/home/luciad/projects/denguehack-lightspeed/data/csv/6_centers.csv");
//        saveAsGeoJSON(fCenterModel, "/home/luciad/projects/denguehack-lightspeed/data/geojson/centers.geojson");
        convertCSVToGeoJSON("/home/luciad/projects/denguehack-lightspeed/data/csv/1_tweets.csv", "/home/luciad/release/LuciadRIA/LuciadRIA_2016.1.06/web/samples/clusteringtweets/data/geojson/1_tweets.geojson");
        convertCSVToGeoJSON("/home/luciad/projects/denguehack-lightspeed/data/csv/2_tweets.csv", "/home/luciad/release/LuciadRIA/LuciadRIA_2016.1.06/web/samples/clusteringtweets/data/geojson/2_tweets.geojson");
        convertCSVToGeoJSON("/home/luciad/projects/denguehack-lightspeed/data/csv/3_tweets.csv", "/home/luciad/release/LuciadRIA/LuciadRIA_2016.1.06/web/samples/clusteringtweets/data/geojson/3_tweets.geojson");
        convertCSVToGeoJSON("/home/luciad/projects/denguehack-lightspeed/data/csv/4_tweets.csv", "/home/luciad/release/LuciadRIA/LuciadRIA_2016.1.06/web/samples/clusteringtweets/data/geojson/4_tweets.geojson");
        convertCSVToGeoJSON("/home/luciad/projects/denguehack-lightspeed/data/csv/5_tweets.csv", "/home/luciad/release/LuciadRIA/LuciadRIA_2016.1.06/web/samples/clusteringtweets/data/geojson/5_tweets.geojson");
        convertCSVToGeoJSON("/home/luciad/projects/denguehack-lightspeed/data/csv/5_tweets.csv", "/home/luciad/release/LuciadRIA/LuciadRIA_2016.1.06/web/samples/clusteringtweets/data/geojson/6_tweets.geojson");
        convertCSVToGeoJSON("/home/luciad/projects/denguehack-lightspeed/data/csv/5_tweets.csv", "/home/luciad/release/LuciadRIA/LuciadRIA_2016.1.06/web/samples/clusteringtweets/data/geojson/7_tweets.geojson");
        convertCSVToGeoJSON("/home/luciad/projects/denguehack-lightspeed/data/csv/5_tweets.csv", "/home/luciad/release/LuciadRIA/LuciadRIA_2016.1.06/web/samples/clusteringtweets/data/geojson/8_tweets.geojson");
        convertCSVToGeoJSON("/home/luciad/projects/denguehack-lightspeed/data/csv/5_tweets.csv", "/home/luciad/release/LuciadRIA/LuciadRIA_2016.1.06/web/samples/clusteringtweets/data/geojson/9_tweets.geojson");
        convertCSVToGeoJSON("/home/luciad/projects/denguehack-lightspeed/data/csv/5_tweets.csv", "/home/luciad/release/LuciadRIA/LuciadRIA_2016.1.06/web/samples/clusteringtweets/data/geojson/10_tweets.geojson");
        convertCSVToGeoJSON("/home/luciad/projects/denguehack-lightspeed/data/csv/5_tweets.csv", "/home/luciad/release/LuciadRIA/LuciadRIA_2016.1.06/web/samples/clusteringtweets/data/geojson/11_tweets.geojson");
//        convertCSVToGeoJSON("/home/luciad/projects/denguehack-lightspeed/data/csv/6_tweets.csv", "/home/luciad/projects/denguehack-lightspeed/data/geojson/6_tweets.geojson");
        convertCSVToGeoJSON("/home/luciad/projects/denguehack-lightspeed/data/csv/1_centers.csv", "/home/luciad/release/LuciadRIA/LuciadRIA_2016.1.06/web/samples/clusteringtweets/data/geojson/1_centers.geojson");
        convertCSVToGeoJSON("/home/luciad/projects/denguehack-lightspeed/data/csv/2_centers.csv", "/home/luciad/release/LuciadRIA/LuciadRIA_2016.1.06/web/samples/clusteringtweets/data/geojson/2_centers.geojson");
        convertCSVToGeoJSON("/home/luciad/projects/denguehack-lightspeed/data/csv/3_centers.csv", "/home/luciad/release/LuciadRIA/LuciadRIA_2016.1.06/web/samples/clusteringtweets/data/geojson/3_centers.geojson");
        convertCSVToGeoJSON("/home/luciad/projects/denguehack-lightspeed/data/csv/4_centers.csv", "/home/luciad/release/LuciadRIA/LuciadRIA_2016.1.06/web/samples/clusteringtweets/data/geojson/4_centers.geojson");
        convertCSVToGeoJSON("/home/luciad/projects/denguehack-lightspeed/data/csv/5_centers.csv", "/home/luciad/release/LuciadRIA/LuciadRIA_2016.1.06/web/samples/clusteringtweets/data/geojson/5_centers.geojson");
        convertCSVToGeoJSON("/home/luciad/projects/denguehack-lightspeed/data/csv/5_centers.csv", "/home/luciad/release/LuciadRIA/LuciadRIA_2016.1.06/web/samples/clusteringtweets/data/geojson/6_centers.geojson");
        convertCSVToGeoJSON("/home/luciad/projects/denguehack-lightspeed/data/csv/5_centers.csv", "/home/luciad/release/LuciadRIA/LuciadRIA_2016.1.06/web/samples/clusteringtweets/data/geojson/7_centers.geojson");
        convertCSVToGeoJSON("/home/luciad/projects/denguehack-lightspeed/data/csv/5_centers.csv", "/home/luciad/release/LuciadRIA/LuciadRIA_2016.1.06/web/samples/clusteringtweets/data/geojson/8_centers.geojson");
        convertCSVToGeoJSON("/home/luciad/projects/denguehack-lightspeed/data/csv/5_centers.csv", "/home/luciad/release/LuciadRIA/LuciadRIA_2016.1.06/web/samples/clusteringtweets/data/geojson/9_centers.geojson");
        convertCSVToGeoJSON("/home/luciad/projects/denguehack-lightspeed/data/csv/5_centers.csv", "/home/luciad/release/LuciadRIA/LuciadRIA_2016.1.06/web/samples/clusteringtweets/data/geojson/10_centers.geojson");
        convertCSVToGeoJSON("/home/luciad/projects/denguehack-lightspeed/data/csv/5_centers.csv", "/home/luciad/release/LuciadRIA/LuciadRIA_2016.1.06/web/samples/clusteringtweets/data/geojson/11_centers.geojson");
//
    }

    private static void convertCSVToGeoJSON(String csvFile, String geojsonOutFile) {
        CSVModelDecoder csvModelDecoder = new CSVModelDecoder();
        try {
            ILcdModel model = csvModelDecoder.decode(csvFile);
            saveAsGeoJSON(model, geojsonOutFile);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void addToCenterModel(String centersCsv) {
        CSVModelDecoder csvModelDecoder = new CSVModelDecoder();
        try {
            ILcdModel model = csvModelDecoder.decode(centersCsv);
            Enumeration elements = model.elements();
            while (elements.hasMoreElements()) {
                ILcdDataObject center = (ILcdDataObject) elements.nextElement();
                CenterTrend centerTrend = findOrInsertCenterTrendFromModel((String) center.getValue("id"));
                double lon = Double.parseDouble((String)center.getValue("lon"));
                double lat = Double.parseDouble((String)center.getValue("lat"));
                centerTrend.insert2DPoint(centerTrend.getPointCount(), lon, lat);
                List<Double> weights = (List<Double>) centerTrend.getValue("weights");
                weights.add(Double.parseDouble((String)center.getValue("weight")));
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static CenterTrend findOrInsertCenterTrendFromModel(String id) {
        Enumeration elements = fCenterModel.elements();
        while (elements.hasMoreElements()) {
            CenterTrend centerTrend = (CenterTrend) elements.nextElement();
            if (centerTrend.getValue("id").equals(id)) {
                return centerTrend;
            }
        }
        //nothing found
        CenterTrend newCenterTrend = new CenterTrend();
        newCenterTrend.setValue("id", id);
        fCenterModel.addElement(newCenterTrend, ILcdModel.FIRE_NOW);
        return newCenterTrend;
    }

    private static void saveAsGeoJSON(ILcdModel model, String geojsonOutFile) {
        TLcdGeoJsonModelEncoder geoJsonModelEncoder = new TLcdGeoJsonModelEncoder();
        geoJsonModelEncoder.setFeatureMetaDataProvider(new TLcdFeatureMetaDataProvider() {
            @Override
            public String getIdPropertyName(Object aObject) {
                return "id";
            }
        });
        try {
            geoJsonModelEncoder.export(model, geojsonOutFile);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static TLcdDataType CENTER_TREND_DATA_TYPE;
    private static TLcdDataModel CLUSTERING_DATA_MODEL;

    static {
        TLcdDataModelBuilder dataModelBuilder = new TLcdDataModelBuilder("CENTER_TREND");
        TLcdDataTypeBuilder dataTypeBuilder = dataModelBuilder.typeBuilder("centerTrend");
        dataTypeBuilder.addProperty("weights", TLcdCoreDataTypes.DOUBLE_ARRAY_TYPE);
        dataTypeBuilder.addProperty("id", TLcdCoreDataTypes.STRING_TYPE);
        CLUSTERING_DATA_MODEL = dataModelBuilder.createDataModel();
        CENTER_TREND_DATA_TYPE = CLUSTERING_DATA_MODEL.getDeclaredType("centerTrend");
    }

    private static class CenterTrend extends TLcdLonLatPolyline implements ILcdDataObject {

        private ILcdDataObject fDelegate;

        public CenterTrend() {
            fDelegate = new TLcdDataObject(CENTER_TREND_DATA_TYPE);
            fDelegate.setValue("weights", new ArrayList<Double>());
            fDelegate.setValue("id", "N/A");
        }

        @Override
        public TLcdDataType getDataType() {
            return fDelegate.getDataType();
        }

        @Override
        public Object getValue(TLcdDataProperty tLcdDataProperty) {
            return fDelegate.getValue(tLcdDataProperty);
        }

        @Override
        public Object getValue(String s) {
            return fDelegate.getValue(s);
        }

        @Override
        public void setValue(TLcdDataProperty tLcdDataProperty, Object o) {
            fDelegate.setValue(tLcdDataProperty, o);
        }

        @Override
        public void setValue(String s, Object o) {
            fDelegate.setValue(s, o);
        }

        @Override
        public boolean hasValue(TLcdDataProperty tLcdDataProperty) {
            return fDelegate.hasValue(tLcdDataProperty);
        }

        @Override
        public boolean hasValue(String s) {
            return fDelegate.hasValue(s);
        }
    }
}
