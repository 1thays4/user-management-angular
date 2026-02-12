import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, timeout, retry } from 'rxjs/operators';
import { CepValidator } from 'src/app/shared/models/validators/cep.validator';
import { ViaCepResponse } from 'src/app/shared/models/viacep-response.model';


@Injectable({
  providedIn: 'root'
})
export class ViaCepService {
  private readonly URL_API = 'https://viacep.com.br/ws';
  private readonly TIMEOUT_MS = 10000;
  private readonly TENTATIVAS_RETRY = 2;
  private readonly RESPOSTA_ERRO: ViaCepResponse = {
    cep: '',
    logradouro: '',
    bairro: '',
    localidade: '',
    uf: '',
    erro: true
  };

  constructor(private clienteHttp: HttpClient) {}

  buscarPorCep(cep: string): Observable<ViaCepResponse> {
    const cepLimpo = CepValidator.limparCep(cep);

    if (cepLimpo.length !== 8) {
      console.warn('CEP inválido:', cep);
      return of(this.RESPOSTA_ERRO);
    }

    return this.clienteHttp.get<ViaCepResponse>(
      `${this.URL_API}/${cepLimpo}/json`
    ).pipe(
      timeout(this.TIMEOUT_MS),
      retry(this.TENTATIVAS_RETRY),
      catchError((erro: HttpErrorResponse) => {
        console.error('Erro ao buscar CEP:', erro);
        return of(this.RESPOSTA_ERRO);
      })
    );
  }
}
