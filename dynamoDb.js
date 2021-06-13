const AWS = require('aws-sdk');
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

ddb.createTable(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Table Created", data);
  }
});

let instance;

class DynamoDB {

	getFindQueryParamsWithUrl(url){
    var params = {
        TableName : "web-scrapping-cache",
        FilterExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": url
        }
    };
    return params;
}

	getInsertQueryParamsForCache(data){
    const params = {
        TableName: "web-scrapping-cache",
        Item:{...data}
    };
    return params;
}

	static getInstance(){
		if(!instance){
			instance = new DynamoDB();
		}
	}
}

module.exports = DynamoDB.getInstance;


















