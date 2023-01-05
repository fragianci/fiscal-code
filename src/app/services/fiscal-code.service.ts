import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { alfanumericiDispari, alfanumericiPari } from '../shared/consts';

@Injectable({
  providedIn: 'root'
})
export class FiscalCodeService {

  constructor(
    private http: HttpClient,
  ) { }

  findCarattereDiControllo(index: number, char: string) {
    if ((index % 2) === 0) {
      return this.returnCarattereDiControllo(alfanumericiDispari, char);
    } else {
      return this.returnCarattereDiControllo(alfanumericiPari, char);
    }
  }

  returnCarattereDiControllo(alfaNumerici: any[], char: string) {
    return alfaNumerici.find((alfaNumerico: any) => alfaNumerico.carattere == char.toUpperCase())?.valore;
  }

  setItemLocalStorage(position: string, value: any) {
    window.localStorage.setItem(position, JSON.stringify(value));
  }

  getItemLocalStorage(position: any): any {
    return window.localStorage.getItem(position);
  }

  readFileExcel() {
    return this.http.get('assets/paesi-esteri/Elenco-codici-e-denominazioni-al-31_12_2021.xlsx', { responseType: 'blob' });
  }

}
