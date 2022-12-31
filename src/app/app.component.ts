import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from './services/api.service';
import { FiscalCodeService } from './services/fiscal-code.service';
import { alfanumericiResto, dateBirthYears, omocodici } from './shared/consts';
import { CodiciFiscali } from './shared/interfaces/codiciFiscali';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'fiscal-code-generator';
  fiscalCodeForm: FormGroup = new FormGroup({});
  consonantRegex = /[bcdfghjklmnpqrstvwxysBCDFGHJKLMNPQRSTVWXYZ]/g;
  vocalsRegex = /[aeiouAEIOU]/g;
  fiscalCode = '';
  codiceCatastale = '';
  carattereDiControllo = '';
  comuniCap = [];
  province: any = [];
  dettaglioComuni: any = [];
  male = false;
  female = false;
  capError = false;
  isLoading = false;
  public dataFields: Object = { value: 'comune' };
  public comuniAutoComplete: string[] = [];
  codiciFiscali: CodiciFiscali[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private fiscalCodeService: FiscalCodeService,
  ) {
    this.fiscalCodeForm = this.formBuilder.group({
      cognome: ['', [Validators.required]],
      nome: ['', [Validators.required]],
      dateBirth: ['', [Validators.required]],
      male: ['', []],
      female: ['', []],
      provincia: ['', [Validators.required]],
      comune: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.apiService.getProvince('').subscribe({
      next: (res: any) => {
        this.province = Object.keys(res.data);
      },
      error: (e: any) => {
        console.log(e);
      }
    });
    this.codiciFiscali = JSON.parse(this.fiscalCodeService.getItemLocalStorage('codici-fiscali'));
    if (this.codiciFiscali === null) this.codiciFiscali = [];
    console.log(this.codiciFiscali);

  }

  async submit() {
    this.fiscalCode = this.extractConsonantsFromSurname(this.fiscalCodeForm.controls['cognome'].value)
      + this.extractConsonantsFromName(this.fiscalCodeForm.controls['nome'].value)
      + this.getDateBirth(this.fiscalCodeForm.controls['dateBirth'].value)
      + this.codiceCatastale;
    this.getCarattereDiControllo();
    this.checkOmofobia();
    const nomeCognome = this.fiscalCodeForm.controls['nome'].value + this.fiscalCodeForm.controls['cognome'].value;
    this.codiciFiscali.push({ nomeCognome: nomeCognome, codiceFiscale: this.fiscalCode });
    this.fiscalCodeService.setItemLocalStorage(`codici-fiscali`, this.codiciFiscali);
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
    if (arrayConsonants && wordTransformed && arrayConsonants.length < 3) {
      wordTransformed = wordTransformed + this.extractVocals(word, arrayConsonants.length);
    } else if (arrayConsonants && arrayConsonants.length > 3) {
      // salta la seconda consonante
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
    const dateBirthArray = dateBirth.split('-');
    const year = dateBirthArray[0].split('').splice(2, 2).join('');
    const month = dateBirthYears.find((valor) => dateBirthArray[1] === valor.month)?.letter;
    const day = this.fiscalCodeForm.controls['female'].value === true ? (+dateBirthArray[2] + 40).toString() : dateBirthArray[2];
    return year + month + day;
  }

  scegliComuneNascita() {
    this.codiceCatastale = this.fiscalCodeForm.controls['comune'].value.codice_catastale;
  }

  getCarattereDiControllo() {
    let index = 0;
    let result = 0;
    let temp: any;
    this.fiscalCode.split('').forEach((char: string) => {
      temp = this.fiscalCodeService.findCarattereDiControllo(index, char);
      if (temp) result += +temp;
      index++;
    });
    let resto = result % 26;
    this.carattereDiControllo = alfanumericiResto.find((alfaNumerico: any) => alfaNumerico.resto === resto.toString())?.lettera ?? '';
    this.fiscalCode = this.fiscalCode.toUpperCase() + this.carattereDiControllo;
  }

  selectProvince(provincia: string) {
    this.apiService.getProvince(provincia).subscribe({
      next: (res: any) => {
        this.dettaglioComuni = res.data[0].dettaglio_comuni;
        this.comuniAutoComplete = this.dettaglioComuni.map((comune: any) => comune.nome);
      },
      error: (e: any) => {
        console.log(e);
      }
    });
  }

  selectCity(city: string) {
    this.codiceCatastale = this.dettaglioComuni.find((comune: any) => comune.nome === city).codice_catastale;
  }

  checkOmofobia() {
    // GNCFNC00M19D208Y
    let indexOmocodici = 0;
    this.codiciFiscali = this.codiciFiscali.map((obj: CodiciFiscali) => {
      if (obj.codiceFiscale === this.fiscalCode) {
        this.fiscalCode = this.transformFiscalCode(this.fiscalCode, indexOmocodici);
        do {
          obj.codiceFiscale = this.transformFiscalCode(obj.codiceFiscale, indexOmocodici);
          indexOmocodici++;
        } while (obj.codiceFiscale === this.fiscalCode);
      }
      return obj;
    });

  }

  trovaCarattereSostitutivo(fiscalCodeArray: string[], positionNumbers: number[], indexOmocodici: number) {
    return omocodici.find((omocodice: any) => omocodice.cifra === +fiscalCodeArray[positionNumbers[indexOmocodici]])?.carattere ?? '';
  }

  transformFiscalCode(actualFiscalCode: string, indexOmocodici: number) {
    // debug better
    let positionNumbers = [14, 13, 12, 10, 9, 7, 6];
    let fiscalCodeArray = actualFiscalCode.split('');
    let carattereSostitutivo = '';
    let isUnique = false;
    do {
      carattereSostitutivo = this.trovaCarattereSostitutivo(fiscalCodeArray, positionNumbers, indexOmocodici);
      fiscalCodeArray.splice(positionNumbers[indexOmocodici], 1, carattereSostitutivo);
      indexOmocodici++;
      actualFiscalCode = fiscalCodeArray.join('');
      let temp = this.codiciFiscali.findIndex((obj2: CodiciFiscali) => actualFiscalCode === obj2.codiceFiscale);
      isUnique = temp != -1 ? true : false;
    } while (isUnique);
    return actualFiscalCode;
  }

}
