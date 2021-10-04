const { buildGPX, GarminBuilder } = require('gpx-builder');
const AWS = require('aws-sdk');
const { Point } = GarminBuilder.MODELS;

module.exports.buildGpx = async (event) => {
    const dynamoDB = new AWS.DynamoDB.DocumentClient();

    var params = {
        TableName: 'position_tablex',
    };

    const items = await dynamoDB.scan(params).promise();

    let points = items.Items.map(
        (item) => new Point(+item.latitude, +item.longitude, { ele: 314.715, time: new Date(item.time), hr: 121 })
    );

    points = sortByKey(points, 'time');

    const gpxData = new GarminBuilder();

    gpxData.setSegmentPoints(points);

    console.log(buildGPX(gpxData.toObject()));

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'GPX-Datei wurde erstellt!',
        }),
    };
};

function sortByKey(array, key) {
    return array.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        return x < y ? -1 : x > y ? 1 : 0;
    });
}
