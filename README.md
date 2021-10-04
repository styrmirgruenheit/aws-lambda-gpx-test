# AWS Lambda that receives location coordinates and stores them in a DynamoDB Table and creates a GPX file.

This project uses the serverless framework in order to deploy the lambda functions to AWS. Please see the instructions at serverless.com for getting started.
The application consists of three functions. The "position" function provides an api that receives coordinates (latitude and longitude). It stores the received information
in a DynamoDB table.
The "gpx" function reads every stored location from the database and creates a GPX file, which is stored in a S3 bucket. The GPX file can be opened by a corresponding viewer
or can be imported in Google Maps.

## Usage

### Deployment

```
$ serverless deploy
```

After deploying, you should see output similar to:

```bash
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Creating Stack...
Serverless: Checking Stack create progress...
........
Serverless: Stack create finished...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service aws-node-http-api.zip file to S3 (711.23 KB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
.................................
Serverless: Stack update finished...
Service Information
service: serverless-http-api
stage: dev
region: us-east-1
stack: serverless-http-api-dev
resources: 12
api keys:
  None
endpoints:
  ANY - https://xxxxxxx.execute-api.us-east-1.amazonaws.com/
functions:
  api: serverless-http-api-dev-hello
layers:
  None
```

_Note_: In current form, after deployment, your API is public and can be invoked by anyone. For production deployments, you might want to configure an authorizer. For details on how to do that, refer to [http event docs](https://www.serverless.com/framework/docs/providers/aws/events/apigateway/).

### Invocation

After successful deployment, you can call the created application via HTTP:

```bash
curl https://xxxxxxx.execute-api.us-east-1.amazonaws.com/
```

Which should result in response similar to the following (removed `input` content for brevity):

```json
{
  "message": "Position erfolgreich gespeichert!",
}
```
