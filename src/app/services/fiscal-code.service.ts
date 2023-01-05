import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { alfanumericiDispari, alfanumericiPari, alfanumericiResto, omocodici } from '../shared/consts';

@Injectable({
  providedIn: 'root'
})
export class FiscalCodeService {

  constructor(
    private http: HttpClient,
  ) { }

  getCarattereDiControllo(fiscalCode: string) {
    let index = 0;
    let result = 0;
    let temp: any = 0;
    let carattereDiControllo = '';
    fiscalCode.split('').forEach((char: string) => {
      if ((index % 2) === 0) {
        temp = this.findCarattereDiControllo(alfanumericiDispari, char);
      } else {
        temp = this.findCarattereDiControllo(alfanumericiPari, char);
      }
      if (temp) result += +temp;
      index++;
    });
    let resto = result % 26;
    carattereDiControllo = alfanumericiResto.find((alfaNumerico: any) => alfaNumerico.resto === resto.toString())?.lettera ?? '';
    return carattereDiControllo;
  }

  findCarattereDiControllo(alfaNumerici: any[], char: string) {
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

  getCodiciFiscali() {
    return JSON.parse(this.getItemLocalStorage('codici-fiscali'));
  }

  trovaCarattereSostitutivo(fiscalCodeArray: string[], positionNumbers: number[], indexOmocodici: number) {
    return omocodici.find((omocodice: any) => omocodice.cifra === +fiscalCodeArray[positionNumbers[indexOmocodici]])?.carattere ?? '';
  }

}
