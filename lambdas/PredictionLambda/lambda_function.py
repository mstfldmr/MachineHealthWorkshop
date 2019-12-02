import greengrasssdk
import logging
import platform
import sys
from threading import Timer

import os
import json

import numpy as np
import mxnet as mx
import mxnet.ndarray as nd
from mxnet import nd, autograd, gluon
from mxnet.gluon.data.vision import transforms


# Setup logging to stdout
logger = logging.getLogger(__name__)
logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)

# Creating a greengrass core sdk client
client = greengrasssdk.client('iot-data')

model_dir = '/trained_models'

ctx = mx.gpu() if mx.context.num_gpus() > 0 else mx.cpu()

with open(os.path.join(model_dir, "model.params"), 'r') as f:
    net_params = json.load(f)


class TimeSeriesNetInfer(gluon.nn.HybridBlock):

    def __init__(self, num_layers, num_units, dropout):
        super(TimeSeriesNetInfer, self).__init__()

        self.num_layers = num_layers
        self.num_units = num_units
        self.dropout = dropout

        with self.name_scope():
            self.net = gluon.nn.HybridSequential(prefix='predictive_maintenance_')
            with self.net.name_scope():
                self.net.add(
                    gluon.nn.HybridLambda(lambda F, x: x.transpose((0, 2, 1))),
                    gluon.nn.Conv1D(channels=32, kernel_size=3, padding=1),
                    gluon.nn.Conv1D(channels=32, kernel_size=3, padding=1),
                    gluon.nn.HybridLambda(lambda F, x: x.transpose((0, 2, 1))),
                    gluon.rnn.LSTM(num_units, num_layers=num_layers, bidirectional=True, layout='NTC', dropout=dropout),
                    gluon.nn.Activation('softrelu'),
                )
            self.proj = gluon.nn.Dense(1, flatten=False)

    def hybrid_forward(self, F, x):
        return self.proj(self.net(x))

net = TimeSeriesNetInfer(net_params['num_layers'], net_params['num_units'], net_params['dropout'])
net.load_parameters(os.path.join(model_dir, "net.params"), ctx)


def lambda_handler(event, context):
    try:
        readings = event['readings']
        print("event: {}".format(readings))
        readings = nd.array(readings)
        input = readings.as_in_context(ctx)
        prediction = net(input)[0]

        client.publish(
            topic='prediction',
            queueFullPolicy='AllOrException',
            payload='Prediction: {} Message received: {}'
                .format(prediction, readings))

        return {"status": "success", "prediction": prediction}


    except Exception as e:
        logger.error('Failed to publish message: ' + repr(e))
        return {"status": "fail"}
