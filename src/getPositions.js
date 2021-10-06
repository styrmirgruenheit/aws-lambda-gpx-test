'use strict';

const AWS = require('aws-sdk');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

module.exports.getPositions = async (event) => {
    const items = await getAllRecords();

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Elemente erfolgreich gelesen',
            items: items.Items,
        }),
    };
};

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
