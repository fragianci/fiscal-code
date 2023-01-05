export interface CodiciFiscali {
  nomeCognome: string;
  codiceFiscale: string;
}

export interface IProvincia {
  sigla: string;
  nomeProvincia: string;
}

export class Provincia implements IProvincia {
  sigla: string = '';
  nomeProvincia: string = '';

  constructor(res: IProvincia) {
    this.sigla = res.sigla;
    this.nomeProvincia = res.nomeProvincia;
  }
}


