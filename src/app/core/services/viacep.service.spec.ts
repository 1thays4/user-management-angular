import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ViaCepService } from './viacep.service';

describe('ViaCepService', () => {
  let servico: ViaCepService;
  let mockHttp: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ViaCepService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    servico = TestBed.inject(ViaCepService);
    mockHttp = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    mockHttp.verify();
  });

  it('deve ser criado', () => {
    expect(servico).toBeTruthy();
  });

  it('deve buscar CEP e retornar dados do endereço', () => {
    const respostaMock = {
      cep: '01310100',
      logradouro: 'Avenida Paulista',
      bairro: 'Bela Vista',
      localidade: 'São Paulo',
      uf: 'SP'
    };

    servico.buscarPorCep('01310-100').subscribe(resultado => {
      expect(resultado.logradouro).toBe('Avenida Paulista');
      expect(resultado.uf).toBe('SP');
      expect(resultado.bairro).toBe('Bela Vista');
    });

    const requisicao = mockHttp.expectOne('https://viacep.com.br/ws/01310100/json');
    expect(requisicao.request.method).toBe('GET');
    requisicao.flush(respostaMock);
  });

  it('deve retornar erro true para CEP inválido', () => {
    servico.buscarPorCep('00000').subscribe(resultado => {
      expect(resultado.erro).toBe(true);
    });
  });

  it('deve lidar com CEP com caracteres especiais', () => {
    const respostaMock = {
      cep: '01310100',
      logradouro: 'Avenida Paulista',
      bairro: 'Bela Vista',
      localidade: 'São Paulo',
      uf: 'SP'
    };

    servico.buscarPorCep('01310-100').subscribe(resultado => {
      expect(resultado.logradouro).toBe('Avenida Paulista');
    });

    const requisicao = mockHttp.expectOne('https://viacep.com.br/ws/01310100/json');
    requisicao.flush(respostaMock);
  });

  it('deve lidar com erros de rede', (concluido) => {
    servico.buscarPorCep('01310-100').subscribe(resultado => {
      expect(resultado.erro).toBe(true);
      concluido();
    });

    for (let i = 0; i < 3; i++) {
      const requisicao = mockHttp.expectOne('https://viacep.com.br/ws/01310100/json');
      requisicao.flush(null, { status: 500, statusText: 'Erro de rede' });
    }
  });
});
