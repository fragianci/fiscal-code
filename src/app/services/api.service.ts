import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient,
  ) { }

  getComuni(cap: string) {
    return this.http.get(`https://test.comuni.openapi.it/cap/${cap}`);
  }

  getProvince(cap: string) {
    return this.http.get(`https://test.comuni.openapi.it/province/${cap}`);
  }
}
