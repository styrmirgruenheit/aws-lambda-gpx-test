'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk');

module.exports.addPosition = async (event) => {
    const body = JSON.parse(event.body);

    const dynamoDB = new AWS.DynamoDB.DocumentClient();

    const position = {
        id: uuid.v1(),
        latitude: body.latitude,
        longitude: body.longitude,
        time: new Date().toISOString(),
        mapUrl: body.mapUrl,
    };

    const positionInfo = {
        TableName: 'position_table',
        Item: position,
    };

    try {
        const result = await dynamoDB.put(positionInfo).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Position erfolgreich gespeichert',
                positionId: result.id,
            }),
        };
    } catch (error) {
        console.log(error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Fehler beim Speichern der Position',
            }),
        };
    }
};
