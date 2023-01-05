import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from './services/api.service';
import { FiscalCodeService } from './services/fiscal-code.service';
import { alfanumericiResto, dateBirthYears, omocodici } from './shared/consts';
import { CodiciFiscali } from './shared/interfaces/codiciFiscali';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'fiscal-code-generator';
  fiscalCodeItalianForm: FormGroup = new FormGroup({});
  fiscalCodeForeignForm: FormGroup = new FormGroup({});
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
  isItalianFiscalCode = true;
  comuniAutoComplete: string[] = [];
  statiAutoComplete: string[] = [];
  dettaglioStati: any[] = [];
  codiciFiscali: CodiciFiscali[] = [];
  indexOmocodici = 0;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private fiscalCodeService: FiscalCodeService,
  ) {
    this.fiscalCodeItalianForm = this.formBuilder.group({
      cognome: ['', [Validators.required]],
      nome: ['', [Validators.required]],
      dateBirth: ['', [Validators.required]],
      male: ['', []],
      female: ['', []],
      provincia: ['', [Validators.required]],
      comune: ['', [Validators.required]],
    });
    this.fiscalCodeForeignForm = this.formBuilder.group({
      cognome: ['', [Validators.required]],
      nome: ['', [Validators.required]],
      dateBirth: ['', [Validators.required]],
      male: ['', []],
      female: ['', []],
      stato: ['', [Validators.required]],
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
    this.readFileExcel();
  }

  submit() {
    if (this.isItalianFiscalCode) {
      this.retrieveFiscalCode(this.fiscalCodeItalianForm);
    } else {
      this.retrieveFiscalCode(this.fiscalCodeForeignForm);
    }
  }

  retrieveFiscalCode(fiscalCodeForm: FormGroup<any>) {
    this.fiscalCode = this.extractConsonantsFromSurname(fiscalCodeForm.controls['cognome'].value)
      + this.extractConsonantsFromName(fiscalCodeForm.controls['nome'].value)
      + this.getDateBirth(fiscalCodeForm.controls['dateBirth'].value)
      + this.codiceCatastale;
    this.getCarattereDiControllo();
    this.checkOmofobia();
    const nomeCognome = fiscalCodeForm.controls['nome'].value + fiscalCodeForm.controls['cognome'].value;
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
    let day!: string;
    if (this.isItalianFiscalCode) {
      day = this.fiscalCodeItalianForm.controls['female'].value === true ? (+dateBirthArray[2] + 40).toString() : dateBirthArray[2];
    } else {
      day = this.fiscalCodeForeignForm.controls['female'].value === true ? (+dateBirthArray[2] + 40).toString() : dateBirthArray[2];
    }
    return year + month + day;
  }

  getCarattereDiControllo() {
    let index = 0;
    let result = 0;
    let temp: any = 0;
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

  selectLocality(locality: string) {
    if (this.isItalianFiscalCode) {
      this.codiceCatastale = this.dettaglioComuni.find((comune: any) => comune.nome === locality).codice_catastale;
      console.log(this.fiscalCodeItalianForm);
    } else {
      this.codiceCatastale = this.dettaglioStati.find((stato: any) => stato['Denominazione IT'] === locality)['Codice AT'];
    }
  }

  checkOmofobia() {
    // GNCFNC00M19D208Y
    this.indexOmocodici = 0;
    this.codiciFiscali = this.codiciFiscali.map((obj: CodiciFiscali) => {
      if (obj.codiceFiscale === this.fiscalCode) {
        this.fiscalCode = this.transformFiscalCode(this.fiscalCode);
        do {
          obj.codiceFiscale = this.transformFiscalCode(obj.codiceFiscale);
          this.indexOmocodici = this.indexOmocodici + 1;
        } while (obj.codiceFiscale === this.fiscalCode);
      }
      return obj;
    });

  }

  trovaCarattereSostitutivo(fiscalCodeArray: string[], positionNumbers: number[]) {
    return omocodici.find((omocodice: any) => omocodice.cifra === +fiscalCodeArray[positionNumbers[this.indexOmocodici]])?.carattere ?? '';
  }

  transformFiscalCode(actualFiscalCode: string) {
    let positionNumbers = [14, 13, 12, 10, 9, 7, 6];
    let fiscalCodeArray = actualFiscalCode.split('');
    let carattereSostitutivo = '';
    let isUnique = false;
    do {
      carattereSostitutivo = this.trovaCarattereSostitutivo(fiscalCodeArray, positionNumbers);
      fiscalCodeArray.splice(positionNumbers[this.indexOmocodici], 1, carattereSostitutivo);
      this.indexOmocodici = this.indexOmocodici + 1;
      actualFiscalCode = fiscalCodeArray.join('');
      let temp = this.codiciFiscali.findIndex((obj2: CodiciFiscali) => actualFiscalCode === obj2.codiceFiscale);
      isUnique = temp != -1 ? true : false;
    } while (isUnique);
    return actualFiscalCode;
  }

  readFileExcel() {
    this.fiscalCodeService.readFileExcel().subscribe({
      next: (data: any) => {
        const reader: FileReader = new FileReader();

        reader.onload = (e: any) => {
          const bstr: string = e.target.result;
          const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
          this.dettaglioStati = XLSX.utils.sheet_to_json(wb.Sheets['Elenco 31122020']);
          this.statiAutoComplete = this.dettaglioStati.map((data: any) => data['Denominazione IT']);
        };
        reader.readAsBinaryString(data);
      },
      error: (error: any) => {
        console.log(error);
      }
    });
  };

  switchFiscalCodeForm() {
    this.isItalianFiscalCode = !this.isItalianFiscalCode;
  }

}
