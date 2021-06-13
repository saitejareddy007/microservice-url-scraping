const QUnit = require('qunit');
const got = require('got');
const {testCases} = require('../Constants');

const getAPIResponse = async ({url, forceReload}) => {
    try {
        const {body, statusCode} = await got.post('https://hasvm8uyr1.execute-api.us-west-1.amazonaws.com/default/microservice-url-scrapping', {
            json: {
                url,
                forceReload
            }, responseType: 'json'
        });
        return {...body, statusCode}
    } catch (err) {
        return {...err.response.body, statusCode: err.response.statusCode}
    }
};


testCases.forEach(item=>{
    const {testCaseName, requestParams, exceptedOutput} = item;
    QUnit.test(testCaseName,async (assert) =>{
        const data = await getAPIResponse(requestParams);
        Object.keys(exceptedOutput).forEach(key=>{
            assert.equal(data[key], exceptedOutput[key]);
        });
    });
});
