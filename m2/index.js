const http = require('http');
const amqp = require('amqplib');
const debug = require('debug')('m2:index');

const PORT = '8000';
const queue1 = 'queue_1';

const fib = (n) => {
    let a = 0;
    let b = 1;
    for (let i = 0; i < n; i++) {
        let c = a + b;
        a = b;
        b = c;
    }
    return a;
};

(async () => {
    try {
        let connection = await amqp.connect('amqp://localhost:5672');
        const channel = await connection.createChannel();
        const { queue } = await channel.assertQueue(queue1, { durable: false });

        await channel.consume(queue, async (message) => {
            channel.ack(message);

            const num = parseInt(message.content.toString(), 10);
            const response = Buffer.from(fib(num).toString());

            channel.sendToQueue(
                message.properties.replyTo,
                Buffer.from(response.toString()),
                {
                    correlationId: message.properties.correlationId,
                }
            );
        });
    } catch (err) {
        debug(`AMQP error ${err}`);
    }
})();

const server = http.createServer();
server.listen(PORT, () => debug(`Server listening on port ${PORT}`));
