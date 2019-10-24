export default class Kafak {
    config: any;
    connected: boolean;
    producer: any;
    constructor(options: any);
    private createProducer;
    connect(): Promise<unknown>;
    push(topic: any, key: any, value: any): Promise<any>;
}
