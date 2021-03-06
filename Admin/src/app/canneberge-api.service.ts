import {Injectable} from '@angular/core';
import {Http, Headers, ResponseContentType, RequestMethod} from '@angular/http';
import 'rxjs/add/operator/map';
import * as FileSaver from "file-saver";

declare var CrossDomainStorage: any;
declare var ga: any;

@Injectable()
export class CannebergeApiService {

  serverUrl = "http://api.canneberge.io/api";
  headers = new Headers();
  apiKey :string;
  user : any = {};
  fileSubPath = '/file';

  constructor(
    private _http : Http
  )
  {

  }

  // This is the method you want to call at bootstrap
  // Important: It should return a Promise
  load(): Promise<any> {
    let p = new Promise((resolve, reject) => {
      let remoteStorage = new CrossDomainStorage("http://portail.canneberge.io", "/views/retrieve.html");
      remoteStorage.requestValue("apiKey", function(key, value){
        resolve(value);
      });
    });

    p.then((data) => {
      console.log(data);
      if(data === null){
        console.log('no connection data');
        window.location.href ='http://portail.canneberge.io';
      }
      else{
        this.apiKey = data.toString();
        ga('set', 'userId', this.apiKey); // Définir l'ID utilisateur à partir du paramètre user_id de l'utilisateur connecté.
        ga('send', 'pageview');
        this.headers.append('x-access-token', this.apiKey);
        this.getUser(this.apiKey).subscribe(
          user => {
            this.user = user;
            if(!this.user.authorization.admin || this.user.authorization.blocked)
              window.location.href ='http://portail.canneberge.io';
          });
        console.log(this.headers);
      }
    });

    return p;
  }

  getUsers(){
    return this._http.get(this.serverUrl + '/users', {headers : this.headers})
      .map(res => res.json());
  }

  getUser(id : number | string) {
    return this._http.get(this.serverUrl + '/users/'+ id, {headers : this.headers})
      .map(res => {
        return res.json().user;
      });
  }

  saveUser(id : string, userValue : any)
  {
    delete userValue.password;
    return this._http.put(this.serverUrl + '/users/' + id, userValue, {headers : this.headers});
  }

  saveNewUser(userValue : any)
  {
    console.log(userValue);
    return this._http.post(this.serverUrl + '/users', userValue, {headers : this.headers})
      .map(res => res.json());
  }

  deleteUser(id : string)
  {
    return this._http.delete(this.serverUrl + '/users/' + id, {headers : this.headers});
  }

  // Service ferme

  getFermes()
  {
    return this._http.get(this.serverUrl + '/fermes', {headers : this.headers})
      .map(res => res.json());
  }

  saveNewFerme(ferme : any) {
    console.log(ferme);
    return this._http.post(this.serverUrl + '/fermes', ferme, {headers : this.headers})
      .map(res => res.json());
  }

  getGeojson (files: File[], espg) {
    let tmpEspg = espg || 26918;
    let url = this.serverUrl + '/shapefile-to-geojson?sourceSrs=' + tmpEspg;
    let formData:FormData = new FormData();
    formData.append('shapefileZip', files[0], files[0].name);
    return this._http.post(url, formData, {
      headers: this.headers
    }).map(res => res.json());
  }

  getShapefile(geojson : any){
    let url = this.serverUrl + '/geojson-to-shapefile';
    console.log('api getshapefile');
    console.log(geojson);
    // this.headers.append('responseType', 'arraybuffer');
    this.headers.append('Content-type', 'application/json');
    return this._http.post(url, {geojson : JSON.stringify(geojson)}, {
      method: RequestMethod.Post,
      responseType: ResponseContentType.Blob,
      headers: this.headers
    })
      .subscribe(
        (response) => {
          var blob = new Blob([response.blob()], {type: 'application/zip'});
          var filename = 'shapefile.zip';
          FileSaver.saveAs(blob, filename);
        }
      );
  }

  getFerme(id : number | string) {
    return this._http.get(this.serverUrl + '/fermes/'+ id, {headers : this.headers})
      .map(res => {
        return res.json().ferme;
      });
  }

  saveFerme(id : number | string, ferme : any){
    return this._http.put(this.serverUrl + '/fermes/' + id, ferme, {headers : this.headers});
  }

  deleteFerme(id : string){
    return this._http.delete(this.serverUrl + '/fermes/' + id, {headers : this.headers});
  }

  sendRCommandLine(commandLine : string){
    let headers = new Headers();
    let formData:FormData = new FormData();
    formData.append('command', commandLine);
    return this._http.post(this.serverUrl + '/executeR', formData, {
      headers: headers
    }).map(res => res.json());
  }

  sendRFiletext(filetext : string){
    let formData:FormData = new FormData();
    formData.append('filetext', filetext);
    return this._http.post(this.serverUrl + '/executeR', formData, {
      headers: this.headers
    }).map(res => res.json());
  }

/*
*  -------------------
*   File service
* ---------------------
*/

  setFileSubPath(fermeId){
    if(typeof fermeId !== "undefined")
      this.fileSubPath = '/fermes/'+ fermeId + '/file';
    else this.fileSubPath = '/file';
  }

  getFile(path){
    return this._http.get(this.serverUrl + this.fileSubPath + path, {headers : this.headers})
      .map(res => res.json());
  }

  postNewFolder(path){
    return this._http.post(this.serverUrl + this.fileSubPath + path, {}, {headers : this.headers})
      .map(res => res);
  }

  deleteWithPath(path){
    return this._http.delete(this.serverUrl + this.fileSubPath + path, {headers : this.headers})
      .map(res => res);
  }

  postNewFile(path, file){
    let inputFile = new Blob(file);
    return this._http.post(this.serverUrl + this.fileSubPath + path, inputFile, {headers : this.headers})
      .map(res => res);
  }

  renameFile(path, newPath){
    return this._http.post(this.serverUrl + this.fileSubPath + path, {newPath : newPath}, {headers : this.headers})
      .map(res => res);
  }

  getInfoPath(path){
    return this._http.get(this.serverUrl + this.fileSubPath + path + '?stat=true', {headers : this.headers})
      .map(res => res.json());
  }

  postMoveFile(originalPath, moveToPath){
    return this._http.post(this.serverUrl + this.fileSubPath + originalPath, {newPath : moveToPath}, {headers : this.headers})
      .map(res => res);
  }

  /*
  Service for rasters
   */

  postNewRaster(time, ferme_id, file){
    console.log(file);
    let inputFile = new Blob(file);
    return this._http.post(this.serverUrl + '/fermes/' + ferme_id + '/rasters/' + file[0].name + '?date=' + time, inputFile, {headers : this.headers})
      .map(res => res);
  }

  deleteRaster(ferme_id, raster_id){
    return this._http.delete(this.serverUrl + '/fermes/' + ferme_id + '/rasters/' + raster_id, {headers : this.headers})
      .map(res => res);
  }

  /*
  Service shapefile
   */
  postNewShapefile(ferme_id, file){
    console.log(file);
    let inputFile = new Blob(file);
    let filename = file[0].name.replace('.zip', '');
    return this._http.post(this.serverUrl + '/fermes/' + ferme_id + '/shapefiles/' + filename, inputFile, {headers : this.headers})
      .map(res => res);
  }

  deleteShapefile(ferme_id, raster_id){
    return this._http.delete(this.serverUrl + '/fermes/' + ferme_id + '/shapefiles/' + raster_id, {headers : this.headers})
      .map(res => res);
  }



}
