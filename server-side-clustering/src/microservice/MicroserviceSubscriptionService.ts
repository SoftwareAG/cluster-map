import { Client, FetchClient, BasicAuth } from '@c8y/client';
import { Request } from "express";
import { EventEmitter } from "events";
import cron from "node-cron";

export class MicroserviceSubscriptionService extends EventEmitter {
    protected baseUrl: string = process.env.C8Y_BASEURL || "https://lora-dev.cumulocity.com";
    protected tenant: string = process.env.C8Y_BOOTSTRAP_TENANT || "t292953154";
    protected user: string = process.env.C8Y_BOOTSTRAP_USER || "servicebootstrap_server-side-clustering";
    protected password: string = process.env.C8Y_BOOTSTRAP_PASSWORD || "YoI52JOoF9zVXS70dZj1PS0rLpHpJJ45";
    protected client: FetchClient;
    protected clients: Map<string, Client> = new Map<string, Client>();

    static NEW_MICROSERVICE_SUBSCRIPTION: string = 'newMicroserviceSubscription';

    constructor() {
        super();
        this.client = new FetchClient(new BasicAuth({ tenant: this.tenant, user: this.user, password: this.password }), this.baseUrl);
        cron.schedule("*/10 * * * * *", () => {
            this.getUsers();
        });
    }

    protected async getUsers() {
        this.client.fetch("/application/currentApplication/subscriptions").then(async result => {
            let allUsers = await result.json();
            let newUsers: Map<string, { tenant: string, name: string, password: string }> = new Map<string, { tenant: string, name: string, password: string }>();
            let newClients: Map<string, Client> = new Map<string, Client>();
            if (allUsers) {
                if (allUsers.users) {
                    allUsers.users.forEach(user => {
                        if (!(Array.from(this.clients.keys()).includes(user.tenant))) {
                            const auth = new BasicAuth({
                                user: user.name,
                                password: user.password,
                                tenant: user.tenant
                            });
                            let client: Client = new Client(auth, this.baseUrl);
                            newClients.set(user.tenant, client);
        
                            this.emit(MicroserviceSubscriptionService.NEW_MICROSERVICE_SUBSCRIPTION, client);
                            newUsers.set(user.tenant, user);
                        } else {
                            newClients.set(user.tenant, this.clients.get(user.tenant));
                        }
                    });
                } else {
                    console.log(allUsers);
                }
            }
            this.clients = newClients;
        }).catch(e => {
            console.log(e);
        });
    }

    getClient(request: Request): Client {
        console.log("Authorization: " + request.headers.authorization);
        let currentTenant: string = Buffer.from(request.headers.authorization.split(" ")[1], 'base64').toString('binary').split("/")[0];
        console.log("Current Tenant: " + currentTenant);
        return this.clients.get(currentTenant);
    }
}