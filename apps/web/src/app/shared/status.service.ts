import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Status } from '@models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StatusService {
  constructor(
    @Inject('BASE_URL') private readonly baseUrl: string,
    private readonly http: HttpClient
  ) {}

  getStatus(id: string): Observable<Status> {
    return this.http.get<Status>(`${this.baseUrl}/api/status`, {
      headers: {
        id,
      },
    });
  }
}
