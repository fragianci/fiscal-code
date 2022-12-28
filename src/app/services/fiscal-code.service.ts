import { Injectable } from '@angular/core';
import { alfanumericiDispari, alfanumericiPari } from '../shared/consts';

@Injectable({
  providedIn: 'root'
})
export class FiscalCodeService {

  constructor() { }

  findCarattereDiControllo(index: number, char: string) {
    if ((index % 2) === 0) {
      return alfanumericiDispari.find((alfaNumerico: any) => alfaNumerico.carattere == char.toUpperCase())?.valore;
    } else {
      return alfanumericiPari.find((alfaNumerico: any) => alfaNumerico.carattere == char.toUpperCase())?.valore;
    }
  }
}