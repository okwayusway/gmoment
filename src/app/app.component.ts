import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import {AngularFireDatabase} from '@angular/fire/database'
import { Observable, Subscription } from 'rxjs';
import  * as L from 'leaflet';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy, AfterViewInit {
  title = 'gmobileweb';
  item: Observable<any>;
  data: Observable<any>;
  subscription1:Subscription;
  subscription2:Subscription;
  map:any;
  layerGroup:L.LayerGroup = new L.LayerGroup();
  tracker:string = ''
  trackerList:Array<string> = [];
  constructor(private fireDB:AngularFireDatabase) {
   this.data = this.fireDB.object("/").valueChanges();
   this.subscription2 = this.data.subscribe(x => {
     this.trackerList = Object.keys(x)
   })
   
  }
  ngAfterViewInit(): void {
    this.initMap();
  }
  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  private initMap(){
    const osm = new L.TileLayer(MapDataInformation.OSM_URL, { maxZoom: 20, attribution: MapDataInformation.OSM_ATTRIB, id: 'osm'});
    this.map = (L.map as any)('map', {
      layers: [osm],
      zoomAnimation:true,
      zoom:8
    }).setView([14.123671, 121.136355]);
    this.layerGroup.addTo(this.map)
  }

  get ICON():L.Icon{
    return L.icon({
      iconUrl:"https://img.icons8.com/fluent/48/000000/user-location.png",
      iconSize: [40,40]
    })
  }

  displayData(id){
    this.layerGroup.clearLayers();
    this.item = this.fireDB.list(`/${id.value}`).valueChanges();
    this.subscription1 = this.item.subscribe((data:IData[]) => {
        data.forEach(data => {
        L.marker({lat: data.location.latitude, lng: data.location.longitude}, {
        icon:this.ICON
       }).bindPopup(this.popUpContent(data.image)).addTo(this.layerGroup)
      })
    })
  }

  popUpContent(image){
    return `<img src="data:image/png;base64,${image}" style="width: 80px; height: 80px;">`
  }
}

 class MapDataInformation{
    static OSM_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    static OSM_ATTRIB = 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
    static LAYER_GROUP:L.LayerGroup = new L.LayerGroup();
    static MAP:L.Map;

}

interface IData{
  image: string,
location:{
  altitude: number,
  latitude: number,
  longitude: number,
  speed: number,
  timeStamp: number
}
notes?:string,
timeSent: number
}