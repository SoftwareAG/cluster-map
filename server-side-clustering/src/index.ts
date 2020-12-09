import Supercluster, { AnyProps, PointFeature } from 'supercluster';
import { Client } from '@c8y/client';
import { MicroserviceSubscriptionService } from './microservice/MicroserviceSubscriptionService';
import express, { Request, Response } from "express";
import * as bodyParser from "body-parser";

export class ClusterMap {
    indexes: Map<Client, Supercluster> = new Map();
    features: Map<Client, Map<string, PointFeature<AnyProps>>> = new Map();
    constructor(subsriptionService: MicroserviceSubscriptionService) {
        subsriptionService.on(MicroserviceSubscriptionService.NEW_MICROSERVICE_SUBSCRIPTION, async (client: Client) => {
            this.features.set(client, new Map());
            let index = new Supercluster({
                log: true,
                radius: 60,
                extent: 256,
                maxZoom: 17
            }).load(await this.getJSON(client));
            this.indexes.set(client, index);
            console.log(index.getTile(0, 0, 0));
        });
    }
    
    async getJSON(client: Client): Promise<PointFeature<AnyProps>[]> {
        console.log("Getting first page of devices...");
        let {data, res, paging} = await client.inventory.list({pageSize: 1000, query: 'has(c8y_Position) and has(c8y_IsDevice)'});
        while(data.length > 0) {
            console.log(`Processing page ${paging.currentPage}...`);
            try {
                data.forEach(mo => {
                    this.features.get(client).set(mo.id, {type: "Feature", geometry: {type: "Point", coordinates: [mo.c8y_Position.lng, mo.c8y_Position.lat]}, properties: {id: mo.id, name: mo.name}});
                })
                console.log("Getting next page...");
                let next = await paging.next();
                paging = next.paging;
                data = next.data;
            } catch(e) {
                console.error(e);
                data = [];
            }
        }
        console.log("All pages processed.");
        return Array.from(this.features.get(client).values());
    }

    async update(client: Client, data) {
        console.log(data);
        let result: any = {};
        if (data.getClusterExpansionZoom) {
            result = {
                expansionZoom: this.indexes.get(client).getClusterExpansionZoom(data.getClusterExpansionZoom),
                center: data.center
            };
        } else if (data) {
            result = this.indexes.get(client).getClusters(data.bbox, data.zoom);
        }

        console.log(result);

        return result;
    }
}

export class App {
    app: express.Application = express();
    PORT = process.env.PORT || 80;

    constructor(subscriptionService: MicroserviceSubscriptionService) {
        let clusterMap: ClusterMap = new ClusterMap(subscriptionService);
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.post("/update", async (req: Request, res: Response, next: express.NextFunction) => {
            res.json(await clusterMap.update(subscriptionService.getClient(req), req.body));
        });
        this.app.listen(this.PORT, () => console.log(`Now listening on port ${this.PORT}!`));
    }
}

new App(new MicroserviceSubscriptionService());