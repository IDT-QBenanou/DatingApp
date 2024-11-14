import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { PaginatedResult } from '../_models/pagination';
import { Message } from '../_models/message';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  paginatedResult = signal<PaginatedResult<Message[]> | null >(null);

  getMessages(pageNumber: number, pageSize: number, container: string) {
    let params = setPaginationHeaders(pageNumber, pageSize);
    
    return this.http.get<Message[]>(this.baseUrl + 'messages', {observe: 'response', params})
      .subscribe(response => {
         setPaginatedResponse(response, this.paginatedResult);
      });
  }

  getMessageThread(username: string) {
    return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + username);
  }

  sendMessage(username: string, content: string) {
    return this.http.post<Message>(this.baseUrl + 'messages', {recipientUsername: username, content});
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



