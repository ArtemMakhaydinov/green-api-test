const amqp = require('amqplib');
const EventEmitter = require('events');
const eventEmitter = new EventEmitter();
const debug = require('debug')('m1:amqplib')

let channel;
const queue1 = 'queue_1';
const queue2 = 'queue_2';

// ========== CONNECTION AND CHANNEL ==========

(async () => {
    try {
        let connection = await amqp.connect('amqp://localhost:5672');
        channel = await connection.createChannel();

        setConsumer();
    } catch (err) {
        debug(`Failed to create amqp channel ${err}`);
    }
})();

// ========== CONSUME ==========

const setConsumer = async () => {
    try{
        const { queue } = await channel.assertQueue(queue2, {
            durable: false,
        });
        await channel.consume(queue, (message) => {
            if (!message) debug('No message');
    
            const correlationId = message.properties.correlationId;
            const content = message.content.toString();
    
            eventEmitter.emit(correlationId, content);
            channel.ack(message);
        });
    } catch (err) {
        debug(`Failed to set consumer ${err}`)
    }
};

// ========== SEND ==========

const sendToQueue = async (data, correlationId) => {
    try{
        const { queue } = await channel.assertQueue(queue1, {
            durable: false,
        });
    
        channel.sendToQueue(queue, data, {
            replyTo: queue2,
            correlationId,
        });
    } catch (err) {
        debug(`Failed to send message ${err}`)
    }

};

module.exports = { eventEmitter, sendToQueue };
