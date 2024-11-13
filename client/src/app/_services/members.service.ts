import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Member } from '../_models/member';
import { of, tap } from 'rxjs';
import { PaginatedResult } from '../_models/pagination';
import { UserParams } from '../_models/userParam';

@Injectable({
  providedIn: 'root'
})

export class MembersService {

  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;
  members = signal<Member[]>([]);

  paginatedResult = signal<PaginatedResult<Member[]> | null>(null);

  memberCache = new Map();


  getMembers(UserParams: UserParams) {

    const response = this.memberCache.get(Object.values(UserParams).join('-'));

    if(response) {
      return this.setPaginatedResponse(response);
    }
    

    let params = this.setPaginationHeader(UserParams.pageNumber, UserParams.pageSize);

    params = params.append('minAge', UserParams.minAge);
    params = params.append('maxAge', UserParams.maxAge);
    params = params.append('gender', UserParams.gender);

    return this.http.get<Member[]>(this.baseUrl + 'users', {observe: 'response', params}).subscribe({
      next: response => {
        this.memberCache.set(Object.values(UserParams).join('-'), response);
        this.setPaginatedResponse(response);
        
      }});
  }

  private setPaginatedResponse(response: HttpResponse<Member[]>) {
    this.paginatedResult.set(
      {
        result: response.body as Member[],
        pagination: JSON.parse(response.headers.get('Pagination')!)
      }
    );
  }

  private setPaginationHeader(pageNumber: number, pageSize: number) {
    let params = new HttpParams();
    params = params.append('pageNumber', pageNumber);
    params = params.append('pageSize', pageSize);
    return params;
  }

  getMember(username: string) {

    console.log(this.memberCache.values());
    const member: Member = [...this.memberCache.values()]
      .reduce((arr, elem) => arr.concat(elem.body), [])
      .find((m: Member) => m.userName === username);

    // const member = this.members().find(x => x.userName === username);
    if(member !== undefined) return of(member);

    return this.http.get<Member>(this.baseUrl + 'users/' + username);
  }

  updateMember(member: Member) {

    return this.http.put(this.baseUrl + 'users', member).pipe(
      tap(() => {
        this.members.update(members => members.map(m => m.userName === member.userName ? member : m));
      })
    );
  }

  setMainPhoto(photoId: number) {

    return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
  }

  deletePhoto(photoId: number) {
      
      return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId);
  }

}
