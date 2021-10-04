const { buildGPX, GarminBuilder } = require('gpx-builder');
const AWS = require('aws-sdk');
const { Point } = GarminBuilder.MODELS;
const uuid = require('uuid');

const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports.buildGpx = async (event) => {

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

    const gpxFile = buildGPX(gpxData.toObject());

    console.log(gpxFile);

    const s3result = await uploadToS3('aws-lambda-gpx-test', 'track-' + uuid.v1() + ".gpx", gpxFile, 'application/gpx+xml');

    console.log('s3-result', s3result);

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'GPX-Datei wurde erstellt!',
        }),
    };
};

const uploadToS3 = (bucket, key, buffer, mimeType) =>
    new Promise((resolve, reject) => {
        s3.upload({ Bucket: bucket, Key: key, Body: buffer, ContentType: mimeType }, function (err, data) {
            if (err) reject(err);
            resolve(data);
        });
    });

function sortByKey(array, key) {
    return array.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        return x < y ? -1 : x > y ? 1 : 0;
    });
}
