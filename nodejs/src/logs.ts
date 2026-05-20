import net from 'net';

export function sendLog(logData: Record<string, any>) {
    const client = net.connect({ port: 5044, host: 'logstash' }, () => {
        client.write(JSON.stringify(logData) + '\n');
        client.end();
    });
    client.on('error', (err) => console.error("Logstash injoignable", err));
}
