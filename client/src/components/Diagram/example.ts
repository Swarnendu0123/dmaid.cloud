export default `
classDiagram
class API_Gateway {
  +handleRequest(event)
  +routeToFunction()
}
class LambdaFunction {
  +execute(event)
  +processData()
}
class DynamoDB {
  +putItem()
  +getItem()
  +query()
}
class S3 {
  +storeObject()
  +retrieveObject()
}
class SNS {
  +publish()
  +subscribe()
}
class SQS {
  +sendMessage()
  +receiveMessage()
}
class Cognito {
  +authenticateUser()
  +authorizeAccess()
}

API_Gateway --> LambdaFunction: Routes Requests
LambdaFunction --> DynamoDB: Reads/Writes Data
LambdaFunction --> S3: Stores/Retrieves Files
LambdaFunction --> SNS: Publishes Messages
SNS --> SQS: Sends Messages to Queue
LambdaFunction --> Cognito: Authenticates Requests
SQS --> LambdaFunction: Triggers Execution
`
