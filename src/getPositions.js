'use strict';

const AWS = require('aws-sdk');

module.exports.getPositions = async (event, context, callback) => {
    const dynamoDB = new AWS.DynamoDB.DocumentClient();

    var params = {
        TableName: 'position_table',
    };

    console.log('Scan mit', params);

    const items = await dynamoDB.scan(params).promise();

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Elemente erfolgreich gelesen',
            items: items.Items,
        }),
    };
};
