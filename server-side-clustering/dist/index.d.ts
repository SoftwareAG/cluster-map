import 'supercluster';
import Supercluster, { AnyProps, PointFeature } from 'supercluster';
import { Client } from '@c8y/client';
import { MicroserviceSubscriptionService } from './microservice/MicroserviceSubscriptionService';
import express from "express";
export declare class ClusterMap {
    index: Supercluster;
    constructor(subsriptionService: MicroserviceSubscriptionService);
    getFilter(page: number): any;
    getJSON(client: Client): Promise<PointFeature<AnyProps>[]>;
    update(data: any): Promise<any>;
}
export declare class App {
    app: express.Application;
    PORT: string | number;
    constructor(subscriptionService: MicroserviceSubscriptionService, clusterMap: ClusterMap);
}
