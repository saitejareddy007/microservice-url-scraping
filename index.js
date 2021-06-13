const AWS = require('aws-sdk');
const _ = require('lodash');
const cheerio = require('cheerio');
const got = require('got');
const ddb = new AWS.DynamoDB();
const dynamo = new AWS.DynamoDB.DocumentClient();

var params = {
  AttributeDefinitions: [
    {
      AttributeName: 'id',
      AttributeType: 'S'
    },
    {
      AttributeName: 'result',
      AttributeType: 'S'
    }
  ],
  KeySchema: [
    {
      AttributeName: 'id',
      KeyType: 'HASH'
    },
    {
      AttributeName: 'result',
      KeyType: 'RANGE'
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1
  },
  TableName: 'web-scrapping-cache',
  StreamSpecification: {
    StreamEnabled: false
  }
};

// Call DynamoDB to create the table
ddb.createTable(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Table Created", data);
  }
});



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

const getScrapDataFromUrl = async (url) => {
    const response = await got(url);    
    const $ = cheerio.load(response.body);
    let finalData = {images:[]};
    $('meta').each(function() {
        const item = $(this);
        const property = item.attr('property');
        const content = item.attr('content');
        if(property && property.split('og:')[1] && property.split(':').length===2){
            if(property.split('og:')[1]==='image'){
                if(content && (content.includes('.png') || content.includes('.jpg') || content.includes('.svg'))){
                    finalData.images.push(content)
                }
            } else {
                finalData[property.split('og:')[1]] = content;
            }
        }
    });
    if(!finalData.title){
        finalData.title = $('title').text();
    }
    if(!finalData.url){
        finalData.url = $('link[rel="canonical"]').attr('href') || url;
    }
    if(!finalData.images || !finalData.images.length){
        finalData.images = [];
        $('img').each(function() {
            const item = $(this);
            const imgSrc = item.attr('src');
            if(imgSrc && (imgSrc.includes('.png') || imgSrc.includes('.jpg') || imgSrc.includes('.svg'))){
                finalData.images.push(imgSrc)
            }
        });
    }
    // Removing undefined values
    finalData = JSON.parse(JSON.stringify(finalData));
    return finalData;
}

const getFindQueryParamsWithUrl = (url) => {
    var params = {
        TableName : "web-scrapping-cache",
        FilterExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": url
        }
    };
    return params;
}

const getInsertQueryParamsForCache = (data) =>{
    const params = {
        TableName: "web-scrapping-cache",
        Item:{...data}
    };
    return params;
}

// getScrapDataFromUrl('https://www.unixtimer.com/').then(console.log)

exports.handler = async (event, context) => {
    let body;
    let statusCode = '200';
    const headers = {
        'Content-Type': 'application/json',
    };
    
    const requestType = _.get(event, 'requestContext.http.method', '');
    const paramsRaw = _.get(event, 'body', '{}');
    let params = {};
    try {
        params = JSON.parse(paramsRaw) || {};
    } catch(err){
        console.log(err);
    }

    try {
        if(requestType==='POST'){
            const {url='', forceReload=false} = params;
            if(!url){
                throw new Error('Url is mandatory.');
            }
            const queryParams = getFindQueryParamsWithUrl(url);
            const cacheData = await dynamo.scan(queryParams).promise();
            
            if(!cacheData || !cacheData.Count || forceReload){
                const result = await getScrapDataFromUrl(url);
                result.id = url;
                result.lastUpdatedTime = Date.now();
                const insertQueryParams = getInsertQueryParamsForCache(result);
                await dynamo.put(insertQueryParams).promise();
                result.id = undefined;
                body = result;
            } else {
                const resData =  _.get(cacheData, 'Items.0', '');
                resData.id = undefined;
                body = resData;
            }
            body = JSON.parse(JSON.stringify(body));
        } else {
            throw new Error(`Unsupported method "${requestType}"`);
        }
    } catch (err) {
        statusCode = '400';
        body = {msg: err.message};
    } finally {
        body = JSON.stringify(body);
    }

    return {
        statusCode,
        body,
        headers,
    };
};