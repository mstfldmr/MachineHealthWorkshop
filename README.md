# Machine Health with AWS IoT Workshop
presented at re:Invent 2019\
by Mustafa Aldemir


## Predictive Maintenance
- Detect potential equipment failure & send notifications
- LSTM (Long Short-term Memory) architecture implemented
- Coded in Python with MXNet
- Data set taken from NASA
- The concept is applicable to other types of machines, data sets and algorithms


Please refer to the presentation in presentation folder for details.


## Steps


### Logging in to AWS

Completing this workshop requires an AWS account. It is highly recommended that the user you are using is associated with the policy “AdministratorAccess”. This will avoid running into problems with the CloudFormation template that creates various roles and resources.

- Go to https://console.aws.amazon.com
- Login with your credentials
- Go to N. Virginia (us-east-1) region using the dropdown box at the upper right of the page


### Launch AWS CloudFormation

This step will launch the required resources.

- Download this template file in your computer https://raw.githubusercontent.com/mstfldmr/MachineHealthWorkshop/master/cloudformation/template.yml
- Go to https://console.aws.amazon.com/cloudformation
- Click 'Create Stack' & select 'With new resources (standard)'
- Step 1 Specify template:
 - Prepare template: Template is ready
 - Template source: Upload a template file
 - Upload the template failure
 - Click Next
- Specify stack details:
 - Stack name: "machinehealth" (must be lower case)
 - Click Next
- Configure stack options:
 - Click Next
- Review machinehealth:
 - Select checkbox 'I acknowledge that AWS CloudFormation might create IAM resources.'
 - Click 'Create Stack

Wait 6-7 min until the resources are launched. Then,
- Go to 'Outputs' tab
- Note 'FirehoseArn' and 'S3Bucket' for later use
- Click 'Cloud9IDE' link


### Create Lambda functions

In this step, you will create the Lambda functions which you will deploy in Greengrass in the next step.

- Type in the 'terminal' tab:
 - `cd OPCUALambda/`
 - `npm install`
 - `cd ..`
 - `cd PredictionLambda/`
 - `pip3 install -r requirements.txt -t ./`

- Click 'AWS Resources' from the right column.
- Right click 'OPCUALambda'
- Click 'Deploy'
- Right click 'PredictionLambda'
- Click 'Deploy'


### Start Greengrass

In this step, you will start Greengrass on the Cloud9 instance.

- Type in the 'terminal' tab:
 - `sudo /greengrass/ggc/core/greengrassd start`


### Publish Lambda functions

In this step, you will publish the lambda functions, and create aliases for them for easy management in the next steps.

- Go to https://console.aws.amazon.com/lambda


- Click 'cloud9-OPCUALambda-...' function you created in the previous steps.
- Click 'Actions'
 - Select 'Publish new version'
 - Version description: 'initial version'
 - Click 'Publish'
- Click 'Actions'
 - Select 'Create alias'
 - Name: 'DevelopmentAlias'
 - Version: '1'
 - Click 'Create'
- Repeat these steps for PredictionLambda function

If you later update the Lambda functions, you will need to:
- Click 'Alias: DevelopmentAlias'
- Click 'Aliases'
- Click 'DevelopmentAlias'
- Change version to the new version number
- Click 'Save'


### Deploy Lambda functions into Greengrass

In this step, you will add Lambda functions, subscriptions, connector and ML resource into your Greengrass group; then deploy them.

- Go to https://console.aws.amazon.com/greengrass/
- Click 'Groups'
- Click 'Group_machinehealth'


- Click 'Lambdas'
- Click 'Add Lambda'
- Click 'Use existing Lambda'
- Select the 'OPCUALambda' function
- Select 'DevelopmentAlias'
- Click 'Finish'
- Click '...' on the upper right corner of the Lambda function
- Click 'Edit configuration'
- Memory limit: '256 MB'
- Lambda lifecycle: 'Make this function long-lived and keep it running indefinitely'
- Click 'Update'
- Repeat these steps for 'PredictionLambda' function
- Click 'Back arrow' on the upper left of the page


- Click 'Connectors'
- Select 'Kinesis Firehose'
- Click 'Next'
- Default delivery stream ARN: 'FirehoseArn' you noted from Cloud9 console
- Maximum number of records to buffer (per stream): 5000
- Memory size: 65535
- Publish interval: 60
- Click 'Add'


- Click 'Subscriptions'
- Click 'Add Subscription'
  - Source: 'OPCUALambda'
  - Target: 'PredictionLambda'
  - Click 'Next'
  - Topic filter: 'predict'
  - Click 'Next'
  - Click 'Finish'


- Click 'Add Subscription'
  - Source: 'PredictionLambda'
  - Target: 'IoT Cloud'
  - Click 'Next'
  - Topic filter: 'prediction'
  - Click 'Next'
  - Click 'Finish'


- Click 'Add Subscription'
  - Source: 'OPCUALambda'
  - Target: 'Kinesis Firehose'
  - Click 'Next'
  - Topic filter: 'kinesisfirehose/message'
  - Click 'Next'
  - Click 'Finish'


- Click 'Resources'
- Click 'Machine Learning'
- Click 'Add a machine learning resource'
- Resource name: 'lstmmodel'
- Model source: 'Upload a model in S3'
- Select 'machinehealth-greengrassworkshop', the bucket you created earlier
- Select 'model/model.tar.gz'
- Local path: '/trained_models'
- Lambda function affiliations: 'cloud9-PredictionLambda-...'
- Select 'Read-only access'
- Click 'Save'


- Click 'Actions'
- Click 'Deploy'
- Click 'Automatic detection'


The status will change to 'Successfully completed' when the deployment is done.

Since you added the Lambda functions with an alias, you won't need to repeat these steps after modifying them but only click 'Deploy'.

You can see the deployed Lambda functions in Greengrass in `/greengrass/ggc/deployment/lambda` folder in Cloud9.

You can see Greengrass logs in `/greengrass/ggc/var/log/` folder in Cloud9.


### See Greengrass logs

- Go to Cloud9
- Type in the 'terminal' tab (you can use TAB button to autocomplete your account number):
 - `sudo su`
 - `tail -f /greengrass/ggc/var/log/user/us-east-1/YOUR-ACCOUNT-NUMBER/cloud9-OPCUALambda-....log`
 - `CTRL + C`
 - `tail -f /greengrass/ggc/var/log/user/us-east-1/YOUR-ACCOUNT-NUMBER/cloud9-PredictionLambda-....log`


### See messages coming to IoT Cloud

- Go to https://console.aws.amazon.com/iot/home?region=us-east-1#/test
- Subscription topic: '#'
- Click 'Subscribe'


### Create an IoT Rule to send a notification

- Go to https://console.aws.amazon.com/iot
- Click 'Act'
- Click 'Rules'
- Click 'Create'
- Name: 'SendNotification'
- Rule query statement: 'SELECT * FROM 'prediction' where 'prediction' < 0.25'
- Click 'Add action'
- Select 'Send a message as an SNS push notification'
- Click 'Configure action'
- SNS target: Create
- Name: 'MachineHealth'
- Click 'Create'
- Role: Create Role
- Name: 'machinehealth_snsrole'
- Click 'Create role'
- Click 'Add action'


- Go to https://console.aws.amazon.com/sns
- Click 'Topics'
- Click 'MachineHealth'
- Click 'Create subscription'
- Protocol: 'SMS'
- Endpoint: 'Your phone number'
- Click 'Create subscription'

### Monitor messages coming to Firehose

- Go to https://console.aws.amazon.com/firehose
- Click 'workshop-FirehoseDeliveryStream-...'
- Click 'Monitoring'


### Check data stored in S3

- Go to https://console.aws.amazon.com/s3
- Click 'machinehealth-greengrassworkshop'
- Click 'data'
- Download and verify some dumped messages


### Train a new model

- Go to https://console.aws.amazon.com/cloudformation/
- Click 'machinehealth' on the left column
- Click 'Outputs' tab
- Click 'SageMakerNotebook' link
- Click 'MachineHealth'
- Click 'MachineHealth.ipynb'
- Click 'Kernel'
- Click 'Restart and Run All'

This notebook trains a model with the provided algorithm based on the original Turbofan Engine Degradation Simulation Data Set. In order to trained a model based on the collected data, the data must be labelled.


### Delete resources

In order to avoid costs, please don't forget to delete the resources you created in the workshop.

- Go to https://console.aws.amazon.com/cloudformation/
- Click 'machinehealth' on the left column
- Click 'Delete'
- Click 'Delete stack'
- Repeat this for 'cloud9-PredictionLambda' and 'cloud9-OPCUALambda' stacks
- After a few minutes, confirm that the stacks are deleted
