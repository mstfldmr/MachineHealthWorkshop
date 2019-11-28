import greengrasssdk
import logging
import platform
import sys
from threading import Timer

# Setup logging to stdout
logger = logging.getLogger(__name__)
logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)

# Creating a greengrass core sdk client
client = greengrasssdk.client('iot-data')




def greengrass_hello_world_run():
    try:
        client.publish(
            topic='periodic',
            queueFullPolicy='AllOrException',
            payload='Hello world! Sent from Greengrass Core.')
    except Exception as e:
        logger.error('Failed to publish message: ' + repr(e))

    # Asynchronously schedule this function to be run again in 5 seconds
    Timer(5, greengrass_hello_world_run).start()


# Start executing the function above
greengrass_hello_world_run()


def lambda_handler(event, context):
    print("event: {}".format(event))

    try:
        client.publish(
            topic='event',
            queueFullPolicy='AllOrException',
            payload='Message received: {}'
            .format(event['input']))
    except Exception as e:
        logger.error('Failed to publish message: ' + repr(e))

    return {"message": "i love greegrass"}
