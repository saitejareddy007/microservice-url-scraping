const _ = require('lodash');
const WebScrapAPIs = require('./webScrapAPIs').getInstance();

/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 *
 * To scan a DynamoDB table, make a GET request with the TableName as a
 * query string parameter. To put, update, or delete an item, make a POST,
 * PUT, or DELETE request respectively, passing in the payload to the
 * DynamoDB API as a JSON body.
 */

const getPostParamsFromEvent = (eventData) => {
    const requestType = _.get(eventData, 'requestContext.http.method', '');
    const paramsRaw = _.get(eventData, 'body', '{}');
    let params = {};
    try {
        params = JSON.parse(paramsRaw) || {};
    } catch (err) {
        console.log(err);
    }
    return {params, requestType};
};

const ApiEventHandler = async (event, context) => {
    let body;
    let statusCode = '200';
    const headers = {'Content-Type': 'application/json'};
    const {params, requestType} = getPostParamsFromEvent(event);

    try {
        if (requestType === 'POST') {
            const data = await WebScrapAPIs.getOgParamsForWebsite(params);
            body = data;
        } else {
            throw new Error(`Unsupported Method, Only POST call accepted"`);
        }
    } catch (err) {
        statusCode = '400';
        body = {msg: err.message};
    } finally {
        body = JSON.stringify(body);
    }

    return {statusCode, body, headers};
};

exports.handler = ApiEventHandler;
