import { Component, Input, OnInit } from '@angular/core';
import { FetchClient } from '@c8y/ngx-components/api';
import * as L from 'leaflet';

//require("./cluster.css");

@Component({
    selector: 'clustered-map',
    templateUrl: './cluster.html'/*,
    styleUrls: ['./cluster.css']*/
})
export class ClusteredMap implements OnInit {
    map: L.Map;
    markers;
    constructor(private fetchClient: FetchClient) {}

    ngOnInit() {
        this.map = L.map('map').setView([0, 0], 2);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        this.markers = L.geoJson(null, {
            pointToLayer: this.createClusterIcon
        }).addTo(this.map);
        
        this.map.on('moveend', async () => this.update());

        this.markers.on('click', async (e) => {
            if (e.layer.feature.properties.cluster_id) {
                const response = await this.fetchClient.fetch('service/server-side-clustering/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                      },
                    body: JSON.stringify({
                        getClusterExpansionZoom: e.layer.feature.properties.cluster_id,
                        center: e.latlng
                    })
                });
                console.log(response);
                let data = await response.json();
                console.log(data);
                this.map.setZoomAround(data.center, data.expansionZoom);
            }
        });

        this.update();
    }

    createClusterIcon(feature, latlng) {
        if (!feature.properties.cluster) return L.marker(latlng);
    
        const count = feature.properties.point_count;
        const size =
            count < 100 ? 'small' :
            count < 1000 ? 'medium' : 'large';
        const icon = L.divIcon({
            html: `<div><span>${  feature.properties.point_count_abbreviated  }</span></div>`,
            className: `marker-cluster marker-cluster-${  size}`,
            iconSize: L.point(40, 40)
        });
    
        return L.marker(latlng, {icon});
    }
    
    async update() {
        const bounds = this.map.getBounds();
        const response = await this.fetchClient.fetch('service/server-side-clustering/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
              },
            body: JSON.stringify({
                bbox: [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()],
                zoom: this.map.getZoom()
            })
        });
        console.log(response);
        let data = await response.json();
        console.log(data);
        this.markers.clearLayers();
        this.markers.addData(data);
    }
}