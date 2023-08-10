const ambqplib = require('../config/amqplib');
const eventEmitter = require('../config/amqplib').eventEmitter;
const debug = require('debug')('m1:controller')
const { v4: uuid } = require('uuid');

exports.get = async (req, res, next) => {
    try {
        const data = Buffer.from(req.body.num.toString());
        const correlationId = uuid();

        await ambqplib.sendToQueue(data, correlationId);

        eventEmitter.once(correlationId, (message) => {
            res.json(message);
        });
    } catch (err) {
        debug(`Controller error ${err}`)
        return next(err);
    }
};
