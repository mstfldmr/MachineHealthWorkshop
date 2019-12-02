#
# c9_bootstrap_lambda.property
#

# add role to C9 instance
# create bashrc and copy to S3
# ssm send_command to bootstrap C9 instance


from __future__ import print_function
import boto3
import logging
import json
import os
import time
import traceback
import cfnresponse
import tarfile

logger = logging.getLogger()
logger.setLevel(logging.INFO)

C9_USER_DATA_VERSION = os.environ['C9_USER_DATA_VERSION']
IOT_CERTIFICATE_ID = os.environ['IOT_CERTIFICATE_ID']
IOT_CERTIFICATE_PEM = os.environ['IOT_CERTIFICATE_PEM']
IOT_PRIVATE_KEY = os.environ['IOT_PRIVATE_KEY']
IOT_ENDPOINT = os.environ['IOT_ENDPOINT']
THING_ARN = os.environ['THING_ARN']
REGION = os.environ['REGION']
BOOTSTRAP_SCRIPT_URL = os.environ['BOOTSTRAP_SCRIPT_URL']
TRAINED_MODEL_URL = os.environ['TRAINED_MODEL_URL']



GG_CONFIG = {
    "coreThing": {
        "caPath": "root.ca.pem",
        "certPath": "cert.pem",
        "keyPath": "private.key",
        "thingArn": THING_ARN,
        "iotHost": IOT_ENDPOINT,
        "ggHost": "greengrass-ats.iot."+REGION+".amazonaws.com"
    },
    "runtime": {
        "cgroup": {
            "useSystemd": "yes"
        }
    },
    "managedRespawn": False,
    "crypto": {
        "caPath" : "file://certs/root.ca.pem",
        "principals": {
            "IoTCertificate": {
                "privateKeyPath": "file://certs/private.key",
                "certificatePath": "file://certs/cert.pem"
            },
            "SecretsManager": {
                "privateKeyPath": "file://certs/private.pem"
            }
        }
    }
}

logger.info(json.dumps(GG_CONFIG))

def lambda_handler(event, context):
    logger.info('event: {}'.format(event))
    logger.info('context: {}'.format(context))
    responseData = {}

    # Immediately respond on Delete
    if event['RequestType'] == 'Delete':
        # Empty Bucket before CloudFormation deletes it
        session = boto3.Session()
        s3 = session.resource(service_name='s3')
        try:
            bucket = s3.Bucket(event['ResourceProperties']['S3_BUCKET'])
            bucket.object_versions.delete()

            logger.info('Bucket '+event['ResourceProperties']['S3_BUCKET']+' objects/versions deleted.')
            cfnresponse.send(event, context, cfnresponse.SUCCESS, responseData, 'CustomResourcePhysicalID')
        except Exception as e:
            logger.error(e, exc_info=True)
            responseData = {'Error': traceback.format_exc(e)}
            cfnresponse.send(event, context, cfnresponse.FAILED, responseData, 'CustomResourcePhysicalID')

    if event['RequestType'] == 'Create':
        try:
            # Open AWS clients
            ec2 = boto3.client('ec2')

            # Get the InstanceId of the Cloud9 IDE
            instance = ec2.describe_instances(Filters=[{'Name': 'tag:Name','Values': ['aws-cloud9-'+event['ResourceProperties']['StackName']+'-'+event['ResourceProperties']['EnvironmentId']]}])['Reservations'][0]['Instances'][0]
            logger.info('instance: {}'.format(instance))

            # Create the IamInstanceProfile request object
            iam_instance_profile = {
                'Arn': event['ResourceProperties']['LabIdeInstanceProfileArn'],
                'Name': event['ResourceProperties']['LabIdeInstanceProfileName']
            }
            logger.info('iam_instance_profile: {}'.format(iam_instance_profile))

            # Wait for Instance to become ready before adding Role
            instance_state = instance['State']['Name']
            logger.info('instance_state: {}'.format(instance_state))
            while instance_state != 'running':
                time.sleep(5)
                instance_state = ec2.describe_instances(InstanceIds=[instance['InstanceId']])
                logger.info('instance_state: {}'.format(instance_state))

            # attach instance profile
            response = ec2.associate_iam_instance_profile(IamInstanceProfile=iam_instance_profile, InstanceId=instance['InstanceId'])
            logger.info('response - associate_iam_instance_profile: {}'.format(response))
            r_ec2 = boto3.resource('ec2')

            # attach additional security group
            associated_sg_ids = [sg['GroupId'] for sg in r_ec2.Instance(instance['InstanceId']).security_groups]
            logger.info("associated_sg_ids: {}".format(associated_sg_ids))

            associated_sg_ids.append(event['ResourceProperties']['SecurityGroupId'])
            logger.info("associated_sg_ids - modified: {}".format(associated_sg_ids))

            response = r_ec2.Instance(instance['InstanceId']).modify_attribute(Groups=associated_sg_ids)
            logger.info('response - modify_attribute security group: {}'.format(response))

            tmp_file_bashrc = '/tmp/bashrc'
            logger.info('creating file: {}'.format(tmp_file_bashrc))
            f = open(tmp_file_bashrc, 'w')
            for v in ['ARN_IOT_PROVISIONING_ROLE', 'ARN_LAMBDA_ROLE', 'IOT_POLICY', 'REGION', 'S3_BUCKET', 'StackName']:
                f.write('export {}={}\n'.format(v, event['ResourceProperties'][v]))
            f.close()

            logger.info('uploading file: {} to s3 bucket: {}'.format(tmp_file_bashrc, event['ResourceProperties']['S3_BUCKET']))
            s3 = boto3.resource('s3')
            s3.meta.client.upload_file(tmp_file_bashrc, event['ResourceProperties']['S3_BUCKET'], 'cloud9/bootstrap/bashrc')
            time.sleep(2)


            #create & upload greengrass credentials & config
            if not os.path.exists('/tmp/creds'):
                os.mkdir('/tmp/creds')

            tmp_file_pem = '/tmp/creds/cert.pem'
            logger.info('creating file: {}'.format(tmp_file_pem))
            f = open(tmp_file_pem, 'w')
            f.write(IOT_CERTIFICATE_PEM)
            f.close()
            logger.info('uploading {}'.format(tmp_file_pem))
            s3.meta.client.upload_file(tmp_file_pem, event['ResourceProperties']['S3_BUCKET'], 'greengrass/credentials/cert.pem')

            tmp_file_key = '/tmp/creds/private.key'
            logger.info('creating file: {}'.format(tmp_file_key))
            f = open(tmp_file_key, 'w')
            f.write(IOT_PRIVATE_KEY)
            f.close()
            logger.info('uploading {}'.format(tmp_file_key))
            s3.meta.client.upload_file(tmp_file_key, event['ResourceProperties']['S3_BUCKET'], 'greengrass/credentials/private.key')

            tmp_file_conf = '/tmp/creds/config.json'
            logger.info('creating file: {}'.format(tmp_file_conf))
            f = open(tmp_file_conf, 'w')
            f.write(json.dumps(GG_CONFIG))
            f.close()
            logger.info('uploading {}'.format(tmp_file_conf))
            s3.meta.client.upload_file(tmp_file_conf, event['ResourceProperties']['S3_BUCKET'], 'greengrass/credentials/config.json')

            time.sleep(2)

            ssm = boto3.client('ssm')
            commands = ['#!/bin/bash', 'cd /tmp',
                        'aws s3 cp ' + TRAINED_MODEL_URL + ' s3://' + event['ResourceProperties']['S3_BUCKET'] + '/model/model.tar.gz',
                        'aws s3 cp s3://' + event['ResourceProperties']['S3_BUCKET'] + '/cloud9/bootstrap/bashrc .',
                        'cat bashrc >> /home/ec2-user/.bashrc',
                        'aws s3 cp s3://' + event['ResourceProperties']['S3_BUCKET'] + '/greengrass/credentials/ ./ggcredentials --recursive',
                        'wget -O c9-user-data.sh ' + BOOTSTRAP_SCRIPT_URL,
                        'chmod +x c9-user-data.sh',
                        './c9-user-data.sh']
            logger.info('commands: {}'.format(commands))

            ping_status = 'Offline'
            ping_status_tries = 0
            ping_status_sleep = 10
            function_timeout = 600
            ping_status_max_tries = int(function_timeout*0.8/ping_status_sleep)
            logger.info("ping_status_max_tries: {}".format(ping_status_max_tries))

            while ping_status != 'Online':
                time.sleep(ping_status_sleep)
                ping_status_tries += 1
                logger.info('ping_status_tries: {}'.format(ping_status_tries))

                response = ssm.describe_instance_information(
                    Filters=[{'Key': 'InstanceIds', 'Values': [ instance['InstanceId'] ] }])
                logger.info('response - describe_instance_information: {}'.format(response))
                if 'InstanceInformationList' in response and len(response['InstanceInformationList']) > 0:
                    ping_status = response['InstanceInformationList'][0]['PingStatus']
                    logger.info('ping_status: {}'.format(ping_status))
                elif ping_status_tries > ping_status_max_tries:
                    raise Exception('SSM ping status not online for instance {} after {} attempts'.format(instance['InstanceId'], ping_status_tries))


            logger.info("ping_status_tries: {}".format(ping_status_tries))

            response = ssm.send_command(
                InstanceIds=[ instance['InstanceId'] ],
                DocumentName='AWS-RunShellScript',
                Parameters={
                    'commands': commands,
                    'workingDirectory': ['/tmp']
                },
                OutputS3BucketName=event['ResourceProperties']['S3_BUCKET'],
                OutputS3KeyPrefix='cloud9/bootstrap/run-command/',
            )
            logger.info('response - send_command: {}'.format(response))

            responseData = {'Success': 'Started bootstrapping for instance: '+instance['InstanceId']}
            cfnresponse.send(event, context, cfnresponse.SUCCESS, responseData, 'CustomResourcePhysicalID')
        except Exception as e:
            logger.error(e, exc_info=True)
            responseData = {'Error': traceback.format_exc(e)}
            cfnresponse.send(event, context, cfnresponse.FAILED, responseData, 'CustomResourcePhysicalID')
