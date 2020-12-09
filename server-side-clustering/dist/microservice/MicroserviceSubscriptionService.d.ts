/// <reference types="node" />
import { Client, FetchClient } from '@c8y/client';
import { Request } from "express";
import { EventEmitter } from "events";
export declare class MicroserviceSubscriptionService extends EventEmitter {
    protected baseUrl: string;
    protected tenant: string;
    protected user: string;
    protected password: string;
    protected client: FetchClient;
    protected clients: Map<string, Client>;
    static NEW_MICROSERVICE_SUBSCRIPTION: string;
    constructor();
    protected getUsers(): Promise<void>;
    getClient(request: Request): Client;
}
