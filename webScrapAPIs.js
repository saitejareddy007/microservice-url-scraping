const _ = require('lodash');
const cheerio = require('cheerio');
const got = require('got');
const DynamoInstance = require('./dynamoDb').getInstance();

let instance;

class WebScrapAPIs {

    // Handler for data cache, errors and fetch new date if cache not available.
    async getOgParamsForWebsite(params) {
        try {
            const {url = '', forceReload = false} = params;
            let finalResponse = {};
            if (!url) {
                throw new Error('Url is mandatory.');
            }
            const cacheData = await DynamoInstance.getPreviousCacheWithUrl(url);
            if (!this.isCacheValid(cacheData) || forceReload) {
                let responseData;
                try{
                    responseData = await got(url);
                } catch(err){
                    responseData = err.response;
                }
                if(!responseData){
                    throw new Error(`Invalid Url`);
                }
                const result = await this.getScrapDataFromUrl(responseData, url);
                result.lastUpdatedTime = Date.now();
                await DynamoInstance.insertCacheData({...result, id: url});
                result.id = undefined;
                finalResponse = result;
            } else {
                const resData = _.get(cacheData, 'Items.0', '');
                resData.id = undefined;
                finalResponse = resData;
            }
            finalResponse = JSON.parse(JSON.stringify(finalResponse));
            return finalResponse
        } catch (e) {
            console.log(e);
            throw new Error(e.message);
        }
    }

    // Fetches the url and scraps the data.
    async getScrapDataFromUrl(response, url) {
        const $ = cheerio.load(response.body);
        let finalData = {images: []};
        $('meta').each(function () {
            const item = $(this);
            const property = item.attr('property');
            const content = item.attr('content');
            if (property && property.split('og:')[1] && property.split(':').length === 2) {
                if (property.split('og:')[1] === 'image') {
                    if (content && (content.includes('.png') || content.includes('.jpg') || content.includes('.svg'))) {
                        finalData.images.push(content)
                    }
                } else {
                    finalData[property.split('og:')[1]] = content;
                }
            }
        });
        if (!finalData.title) {
            finalData.title = $('title').text();
        }
        if (!finalData.url) {
            finalData.url = $('link[rel="canonical"]').attr('href') || url;
        }
        if (!finalData.images || !finalData.images.length) {
            finalData.images = [];
            $('img').each(function () {
                const item = $(this);
                const imgSrc = item.attr('src');
                if (imgSrc && (imgSrc.includes('.png') || imgSrc.includes('.jpg') || imgSrc.includes('.svg'))) {
                    finalData.images.push(imgSrc)
                }
            });
        }
        // Removing undefined values
        finalData = JSON.parse(JSON.stringify(finalData));
        return finalData;
    }

    // Invalidating cache after 10 min
    isCacheValid(cacheData) {
        if (cacheData && cacheData.Count) {
            const {lastUpdatedTime = 0}= _.get(cacheData, 'Items.0', {});
            const timeDiff = (Date.now() - lastUpdatedTime) / 1000;
            if (timeDiff < 600) {
                return true;
            }
        }
        return false;
    }

    static getInstance() {
        if (!instance) {
            instance = new WebScrapAPIs();
        }
        return instance;
    }
}

exports.getInstance = WebScrapAPIs.getInstance;
