# microservice-url-scraping
Web Scraping for Og Params using NodeJs, AWS Lambda, Dynamo DB

## Step to deploy this project:
1. clone the repository => ```git clone https://github.com/saitejareddy007/microservice-url-scraping.git```
2. Enter the folder and install dependencies => ```cd microservice-url-scraping && npm install```
3. zip the folder => ```zip -r ../microservice-url-scrapping.zip ./```
4. create an AWS lambda function, option need to be selected while creating:  
    1. Select 'Use a blueprint' option.
    2. And select microservice http endpoint from the drop down.
    3. And then select create new api, api type: HTTP API and then click on 'create function' button.
5. After creating lambda function, you just need to upload the zip file that you have created in the 3rd step.
6. I have added unit test cases for the api deployed in AWS. you can just run it with => ```npm test```
