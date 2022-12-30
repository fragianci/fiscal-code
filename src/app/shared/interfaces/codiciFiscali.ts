export interface CodiciFiscaliInterface {
  nomeCognome: string;
  codiceFiscale: string;
}

export class CodiciFiscali implements CodiciFiscaliInterface {
  nomeCognome: string = '';
  codiceFiscale: string = '';
}
