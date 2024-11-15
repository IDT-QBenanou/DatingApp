import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { PaginatedResult } from '../_models/pagination';
import { Message } from '../_models/message';
import { HttpParams } from '@angular/common/http';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  baseUrl = environment.apiUrl;
  hubUrl = environment.hubUrl;
  private http = inject(HttpClient);
  private hubConnection?: HubConnection;
  paginatedResult = signal<PaginatedResult<Message[]> | null >(null);
  messageThread = signal<Message[]>([]);

  createHubConnection(user: User, otherUsername : string) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'message?user=' + otherUsername, {
        accessTokenFactory: () => user.token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch(error => console.log(error));

    this.hubConnection.on('ReceiveMessageThread', messages => {
      this.messageThread.set(messages);
    });

    this.hubConnection.on('NewMessage', message => {
      this.messageThread.update(messages => [...messages, message]);
    });

    // this.hubConnection.on('UpdatedMessage', message => {
    //   this.paginatedResult.update(messages => {
    //     return messages.map(m => m.id === message.id ? message : m);
    //   });
    // });

  }

  stopHubConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }

  getMessages(pageNumber: number, pageSize: number, container: string) {
    let params = setPaginationHeaders(pageNumber, pageSize);
    params = params.set('Container', container);
    
    return this.http.get<Message[]>(this.baseUrl + 'messages', {observe: 'response', params})
      .subscribe(response => {
         setPaginatedResponse(response, this.paginatedResult);
      });
  }

  getMessageThread(username: string) {
    return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + username);
  }

  async sendMessage(username: string, content: string) {
    // return this.http.post<Message>(this.baseUrl + 'messages', {recipientUsername: username, content});

    return this.hubConnection?.invoke('SendMessage', {recipientUsername: username, content})
  }

  deleteMessage(id: number) {
    return this.http.delete(this.baseUrl + 'messages/' + id);
  }
}

function setPaginationHeaders(pageNumber: number, pageSize: number) {
  let params = new HttpParams();
  params = params.set('pageNumber', pageNumber.toString());
  params = params.set('pageSize', pageSize.toString());
  return params;
}

function setPaginatedResponse(response: HttpResponse<Message[]>, paginatedResult: WritableSignal<PaginatedResult<Message[]> | null>) {
  const pagination = response.headers.get('Pagination');
  if (pagination !== null) {
    paginatedResult.set(JSON.parse(pagination));
  }
  if (response.body && pagination) {
    paginatedResult.set(new PaginatedResult<Message[]>(response.body, JSON.parse(pagination)));
  }
}



