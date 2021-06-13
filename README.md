# microservice-url-scraping
Web Scraping for Og Params using NodeJs, AWS Lambda, Dynamo DB

## Step to deploy this project:
1. clone the repository => git clone https://github.com/saitejareddy007/microservice-url-scraping.git
2. Enter the folder and install dependencies => cd microservice-url-scraping && npm install
3. zip the folder => zip -r ../microservice-url-scrapping.zip ./
4. create an AWS lambda function, option need to be selected while creating:
    i. Use Blue print.
    ii. And select microservice http endpoint from the drop down.
    iii. And then select create new api, api type: HTTP API and then click on create function.
5. After creating lambda function, you just need to upload the zip file that created in the 3rd step.
