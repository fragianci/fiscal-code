import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from './services/api.service';
import { alfanumericiDispari, alfanumericiPari, dateBirthYears, alfanumericiResto } from './shared/consts';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'fiscal-code-generator';
  fiscalCodeForm: FormGroup = new FormGroup({});
  consonantRegex = /[bcdfghjklmnpqrstvwxysBCDFGHJKLMNPQRSTVWXYZ]/g;
  vocalsRegex = /[aeiouAEIOU]/g;
  fiscalCode = '';
  codiceCatastale = '';
  carattereDiControllo = '';
  comuniCap = [];
  male = false;
  female = false;
  capError = false;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
  ) {
    this.fiscalCodeForm = this.formBuilder.group({
      cognome: ['', [Validators.required]],
      nome: ['', [Validators.required]],
      dateBirth: ['', [Validators.required]],
      male: ['', []],
      female: ['', []],
      cap: ['', [Validators.required]],
      comune: ['', [Validators.required]],
    });
  }

  submit() {
    setTimeout(() => {
      this.fiscalCode = this.extractConsonantsFromSurname(this.fiscalCodeForm.controls['cognome'].value)
        + this.extractConsonantsFromName(this.fiscalCodeForm.controls['nome'].value)
        + this.getDateBirth(this.fiscalCodeForm.controls['dateBirth'].value)
        + this.codiceCatastale;
      this.getCarattereDiControllo();
    }, 400);
  }

  extractConsonantsFromSurname(word: string) {
    let wordTransformed = word.match(this.consonantRegex)?.slice(0, 3).join('');
    if (wordTransformed && wordTransformed.length < 3) {
      wordTransformed += this.extractVocals(word, wordTransformed.length);
    } else if (!wordTransformed) {
      wordTransformed = this.extractVocals(word, 0);
    }
    if (wordTransformed) return wordTransformed;
    else return '';
  }

  extractConsonantsFromName(word: string) {
    let arrayConsonants = word.match(this.consonantRegex);
    let wordTransformed = arrayConsonants?.join('');
    if (arrayConsonants && arrayConsonants.length < 3) {
      wordTransformed = arrayConsonants.join('') + this.extractVocals(word, arrayConsonants.length);
    } else if (arrayConsonants && arrayConsonants.length > 3) {
      wordTransformed = arrayConsonants.slice(0, 1).join('') + arrayConsonants.splice(2, 2).join('');
    } else if (!arrayConsonants) {
      wordTransformed = this.extractVocals(word, 0);
    }
    if (wordTransformed) return wordTransformed;
    else return '';
  }

  extractVocals(word: string, consonantsLength: number) {
    let vocals = word.match(this.vocalsRegex)?.slice(0, 3 - consonantsLength).join('');
    if (consonantsLength === 1 && vocals && vocals.length === 1) {
      vocals += 'x';
    } else if (consonantsLength === 2 && !vocals) {
      vocals = 'x';
    } else if (consonantsLength === 0 && vocals && vocals.length === 2) {
      vocals += 'x';
    }
    return vocals;
  }

  getDateBirth(dateBirth: string) {
    let dateBirthArray = dateBirth.split('-');
    let year = dateBirthArray[0].split('').splice(2, 2).join('');
    let month = dateBirthYears.find((valor) => dateBirthArray[1] === valor.month)?.letter;
    let day = this.fiscalCodeForm.controls['female'].value === true ? (+dateBirthArray[2] + 40).toString() : dateBirthArray[2];
    return year + month + day;
  }

  sendCap() {
    let cap = this.fiscalCodeForm.controls['cap'].value;
    console.log(this.fiscalCodeForm.controls);
    this.apiService.getComuni(cap).subscribe({
      next: (res: any) => {
        this.comuniCap = res.data[0].dettaglio_comuni;
        this.capError = false;
      },
      error: (error: any) => {
        console.log(error);
        if (error.status === 404) this.capError = true;
      }
    });
  }

  scegliComuneNascita() {
    this.codiceCatastale = this.fiscalCodeForm.controls['comune'].value.codice_catastale;
  }

  getCarattereDiControllo() {
    let index = 0;
    let a = 0;
    let b = 0;
    this.fiscalCode.split('').forEach((char: string) => {
      if ((index % 2) === 0) {
        let c = alfanumericiDispari.find((alfaNumerico: any) => alfaNumerico.carattere == char.toUpperCase())?.valore;
        if (c) a += +c;
      } else {
        let c = alfanumericiPari.find((alfaNumerico: any) => alfaNumerico.carattere == char.toUpperCase())?.valore;
        if (c) b += +c;
      }
      index++;
    });
    let result = a + b;
    let resto = result % 26;

    this.carattereDiControllo = alfanumericiResto.find((alfaNumerico: any) => alfaNumerico.resto === resto.toString())?.lettera ?? '';
    this.fiscalCode += this.carattereDiControllo;
  }

  setDisable() {
    switch (true) {
      case (!this.male && this.female):
        console.log('ciao');

        return false;
        break;
      case (this.male && !this.female):
        console.log('ciao');

        return false;
        break;
      case (this.male && this.female):
        console.log(this.male && this.female);

        return true;
        break;
      default:
        return true;
        break;
    }

  }
}
