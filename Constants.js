module.exports = {
    DB_CREATION_PARAMS: {
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
    },
    testCases: [
        {
            testCaseName: 'Basic Api Test',
            requestParams: {
                url: 'https://www.youtube.com/watch?v=sOEg_YZQsTI',
                forceReload: false
            },
            exceptedOutput: {
                url: 'https://www.youtube.com/watch?v=sOEg_YZQsTI',
                title: 'Baahubali - The Beginning Trailer | Prabhas,Rana Daggubati,Anushka Shetty,Tamannaah|Bahubali Trailer',
                description: "T-Series Telugu presents \"Baahubali Trailer\" starring Prabhas, Rana Daggubati, Anushka Shetty, Tamannaah Bhatia in lead roles. Watch BAAHUBALI TRAILER IN TAM...",
                statusCode: 200
            }
        },
        {
            testCaseName: 'Test Cases for no og:url but parsed from web page, found canonical',
            requestParams: {
                url: 'https://www.unixtimer.com/',
                forceReload: false
            },
            exceptedOutput: {
                url: 'https://www.unixtimer.com',
                title: 'Unix Timer - Epoch DateTimestamp Online Converter',
                description: "Easy Unix/Epoch timestamp online conversion tool for developer or computer programmers to any preferable format with programming explanation.",
                statusCode: 200
            }
        },
        {
            testCaseName: 'Test Cases with neglected cache',
            requestParams: {
                url: 'https://www.unixtimer.com/',
                forceReload: true
            },
            exceptedOutput: {
                url: 'https://www.unixtimer.com',
                title: 'Unix Timer - Epoch DateTimestamp Online Converter',
                description: "Easy Unix/Epoch timestamp online conversion tool for developer or computer programmers to any preferable format with programming explanation.",
                statusCode: 200
            }
        },
        {
            testCaseName: 'Test Cases with no url param',
            requestParams: {
                forceReload: true
            },
            exceptedOutput: {
                msg: 'Url is mandatory.',
                statusCode: 400
            }
        },
        {
            testCaseName: 'Test Cases with Invalid url param',
            requestParams: {
                url: 'something random',
                forceReload: true
            },
            exceptedOutput: {
                msg: 'Invalid URL: something random',
                statusCode: 400
            }
        },
    ]
};
