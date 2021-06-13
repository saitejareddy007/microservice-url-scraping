const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB();
const dynamo = new AWS.DynamoDB.DocumentClient();
const {DB_CREATION_PARAMS} = require('./Constants');

ddb.createTable(DB_CREATION_PARAMS, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Table Created", data);
  }
});

let instance;

class DynamoDB {

	async getPreviousCacheWithUrl(url){
        const queryParams = {
            TableName : "web-scrapping-cache",
            FilterExpression: "id = :id",
            ExpressionAttributeValues: {
                ":id": url
            }
        };
        const cacheData = await dynamo.scan(queryParams).promise();
        return cacheData;
    }

	async insertCacheData(data){
	    try{
            const queryParams = {
                TableName: "web-scrapping-cache",
                Item:{...data}
            };
            await dynamo.put(queryParams).promise();
            return true;
        } catch (e) {
	        console.log('Error', e);
            return false;
        }
    }

	static getInstance(){
		if(!instance){
			instance = new DynamoDB();
		}
	}
}

exports.getInstance = DynamoDB.getInstance;


















