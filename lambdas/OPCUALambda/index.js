'use strict';
const uuidv1 = require('uuid/v1');
const opcua = require("node-opcua");
const Greengrass = require('greengrass-core-sdk');

// Creating the Greengrass broker instance.
const iot = new Greengrass.IotData();


const serverName = 'MyServer';
const endpointUrl = 'opc.tcp://localhost:55389';
const nodeId = "ns=1;s=MyPlant";

var subscription;


/**
 * Helper function that publishes the given `object` to Kinesis Firehose Connector
 * @return a promise resolved upon a successful `publish`.
 * @param {*} object the message to publish.
 */
const firehose_topic = 'kinesisfirehose/message'
const firehose_publish = (id, object) => {
  const messageToPublish = {
    "request": {
      "data": JSON.stringify(object)
    },
    "id": id
  };
  return new Promise((resolve, reject) => {
    iot.publish({
        topic: firehose_topic,
        payload: JSON.stringify(messageToPublish)
      },
      (err) => err ? reject(err) : resolve());
  });
};

/**
 * Helper function that publishes the given `object`.
 * @return a promise resolved upon a successful `publish`.
 * @param {*} object the message to publish.
 */
const publish = (topic, object) => {
  return new Promise((resolve, reject) => {
    iot.publish({
        topic,
        payload: JSON.stringify(object)
      },
      (err) => err ? reject(err) : resolve());
    console.log('publishing to ' + topic + ' message: ' + JSON.stringify(object));
  });
};


async function main() {

  try {
    //const client = new opcua.OPCUAClient(
    const client = await opcua.OPCUAClient.create({
      connectionStrategy: {
        maxRetry: 2,
        initialDelay: 2000,
        maxDelay: 10 * 1000
      },
      endpoint_must_exist: false
    });
    client.on("backoff", () => console.log("retrying connection"));
    client.on("send_request", () => {});
    client.on("receive_response", () => {});

    await client.connect(endpointUrl);

    const session = await client.createSession();



    subscription = opcua.ClientSubscription.create(session, {
      requestedPublishingInterval: 1000,
      requestedLifetimeCount: 10,
      requestedMaxKeepAliveCount: 2,
      maxNotificationsPerPublish: 10,
      publishingEnabled: true,
      priority: 10
    });
    subscription
      .on("started", () => console.log(`subscription started - subscriptionId= ${subscription.subscriptionId}`))
      .on("keepalive", () => console.log("keepalive"))
      .on("terminated", () => console.log("subscription terminated"));




    var monitoredItem = opcua.ClientMonitoredItem.create(subscription, {
        nodeId: opcua.resolveNodeId(nodeId),
        attributeId: opcua.AttributeIds.Value
      }, {
        samplingInterval: 100,
        discardOldest: true,
        queueSize: 10
      },
      opcua.TimestampsToReturn.Both
    );
    monitoredItem.on('changed', (dataValue) => {
      console.log(`received => ${dataValue.value.value}`);
      console.log(`received => ${dataValue}`);

      const payload = {
        plant: serverName,
        nodeId: nodeId,
        //nodeName: nodeName,
        value: dataValue.value.value,
        timestamp: Date.now()
      };

      var topic = serverName + '/' + nodeId;
      // Publishing a message on the given `topic`.
      publish(topic, payload);

      // publish a message to the local Firehose Connector
      const req_id = uuidv1();
      firehose_publish(req_id, payload);
    });


  } catch (err) {
    console.log("Error !!!", err);
  }

  setInterval(function() {}, 3000);

}




main();


exports.lambda_handler = async (event) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify('Not implemented'),
  };
  return response;
};
