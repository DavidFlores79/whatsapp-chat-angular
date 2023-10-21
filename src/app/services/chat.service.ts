import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { GLOBAL } from './global';

@Injectable({
  providedIn: 'root'
})

export class ChatService {

  public url = GLOBAL.url;

  constructor(
    private _http: HttpClient
  ) { }


  getConversations():Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.get(this.url + '/get_conversations', { headers: headers });

  }

  getMessages( id: String ):Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.get(`${this.url}/conversations/${id}/messages`, { headers: headers });

  }

  sendMessage( body: any ):Observable<any> {
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    return this._http.post(`${this.url}/send`, body, { headers: headers, });

  }

  uploadFile( data: any ):Observable<any> {
    let headers = new HttpHeaders();
    const formData = new FormData();
    formData.append('file', data.file);
    return this._http.post(`${this.url}/upload_file`, formData , { headers: headers, });

  }
}
