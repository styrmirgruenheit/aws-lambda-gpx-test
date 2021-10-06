const { buildGPX, GarminBuilder } = require('gpx-builder');
const AWS = require('aws-sdk');
const { Point } = GarminBuilder.MODELS;
const uuid = require('uuid');

const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports.buildGpx = async (event) => {
    const items = await getAllRecords();

    const gpxFile = buildGPXFile(items);

    const s3result = await uploadToS3('aws-lambda-gpx-test', 'track-' + uuid.v1() + '.gpx', gpxFile, 'application/gpx+xml');
    console.log('Result of upload to s3', s3result);

    for (const item of items) {
        await deleteItem(item.id);
    }

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

function buildGPXFile(items) {
    let points = items.map(
        (item) => new Point(+item.latitude, +item.longitude, { ele: 314.715, time: new Date(item.time), hr: 121 })
    );

    points = sortByKey(points, 'time');

    const gpxData = new GarminBuilder();
    gpxData.setSegmentPoints(points);

    const gpxFile = buildGPX(gpxData.toObject());
    return gpxFile;
}

function sortByKey(array, key) {
    return array.sort(function (a, b) {
        var x = a[key];
        var y = b[key];
        return x < y ? -1 : x > y ? 1 : 0;
    });
}

const getAllRecords = async () => {
    let params = {
        TableName: 'position_table',
    };
    let items = [];
    let data = await dynamoDB.scan(params).promise();

    items = [...items, ...data.Items];
    while (typeof data.LastEvaluatedKey != 'undefined') {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        data = await dynamoDB.scan(params).promise();
        items = [...items, ...data.Items];
    }
    return items;
};

const deleteItem = (id) => {
    var params = {
        TableName: 'position_table',
        Key: {
            id: id,
        },
    };

    return new Promise(function (resolve, reject) {
        dynamoDB.delete(params, function (err, data) {
            if (err) {
                console.log('Error Deleting ', id, err);
                reject(err);
            } else {
                console.log('Success Deleting ', id, data);
                resolve();
            }
        });
    });
};
