const amqplib = require('../config/amqplib');
const eventEmitter = require('../config/amqplib').eventEmitter;
const debug = require('debug')('m1:controller')
const { v4: uuid } = require('uuid');

exports.get = async (req, res, next) => {
    try {
        const data = Buffer.from(req.body.num.toString());
        const correlationId = uuid();

        eventEmitter.once(correlationId, (message) => {
            res.json(message);
        });

        amqplib.sendToQueue(data, correlationId);
    } catch (err) {
        debug(`Controller error ${err}`)
        return next(err);
    }
};
