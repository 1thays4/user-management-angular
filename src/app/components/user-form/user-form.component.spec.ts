import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';

import { UserFormComponent } from './user-form.component';
import { UserService } from '../../core/services/user.service';
import { ViaCepService } from '../../core/services/viacep.service';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;
  let servicoUsuario: jasmine.SpyObj<UserService>;
  let servicoViaCep: jasmine.SpyObj<ViaCepService>;
  let servicoMensagem: jasmine.SpyObj<MessageService>;
  let roteador: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['adicionarUsuario', 'atualizarUsuario']);
    const viaCepServiceSpy = jasmine.createSpyObj('ViaCepService', ['buscarPorCep']);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate', 'getCurrentNavigation']);
    routerSpy.getCurrentNavigation.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [UserFormComponent, ReactiveFormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserService, useValue: userServiceSpy },
        { provide: ViaCepService, useValue: viaCepServiceSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    servicoUsuario = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    servicoViaCep = TestBed.inject(ViaCepService) as jasmine.SpyObj<ViaCepService>;
    servicoMensagem = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    roteador = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  it('deve validar campos obrigatórios no formulário pessoal', () => {
    component.formularioDadosPessoais.patchValue({
      primeiroNome: '',
      ultimoNome: '',
      genero: ''
    });

    expect(component.formularioDadosPessoais.valid).toBeFalsy();
    expect(component.formularioDadosPessoais.get('primeiroNome')?.hasError('required')).toBeTruthy();
    expect(component.formularioDadosPessoais.get('ultimoNome')?.hasError('required')).toBeTruthy();
    expect(component.formularioDadosPessoais.get('genero')?.hasError('required')).toBeTruthy();
  });

  it('deve validar padrão do CEP', () => {
    component.formularioEndereco.patchValue({ cep: '123' });
    expect(component.formularioEndereco.get('cep')?.invalid).toBeTruthy();

    component.formularioEndereco.patchValue({ cep: '01310-100' });
    expect(component.formularioEndereco.get('cep')?.valid).toBeTruthy();
  });

  it('deve validar que número aceita apenas dígitos', () => {
    component.formularioEndereco.patchValue({ numero: 'abc' });
    expect(component.formularioEndereco.get('numero')?.hasError('pattern')).toBeTruthy();

    component.formularioEndereco.patchValue({ numero: '123' });
    expect(component.formularioEndereco.get('numero')?.hasError('pattern')).toBeFalsy();
  });

  it('deve avançar para próxima aba quando formulário pessoal for válido', () => {
    component.formularioDadosPessoais.patchValue({
      primeiroNome: 'João',
      ultimoNome: 'Silva',
      genero: 'M'
    });

    component.proximoPasso();
    expect(component.abaAtiva).toBe(1);
  });

  it('deve buscar CEP e preencher campos de endereço', (concluido) => {
    const respostaMock = {
      cep: '01310100',
      logradouro: 'Avenida Paulista',
      bairro: 'Bela Vista',
      localidade: 'São Paulo',
      uf: 'SP'
    };

    servicoViaCep.buscarPorCep.and.returnValue(of(respostaMock));
    component.formularioEndereco.patchValue({ cep: '01310-100' });

    component.aoAlterarCep();

    setTimeout(() => {
      expect(servicoViaCep.buscarPorCep).toHaveBeenCalledWith('01310-100');
      expect(component.formularioEndereco.get('estado')?.value).toBe('SP');
      expect(component.formularioEndereco.get('rua')?.value).toBe('Avenida Paulista');
      expect(component.formularioEndereco.get('bairro')?.value).toBe('Bela Vista');
      concluido();
    }, 100);
  });

  it('deve lidar com erro de CEP não encontrado', (concluido) => {
    const respostaMock = { cep: '', logradouro: '', bairro: '', localidade: '', uf: '', erro: true };
    servicoViaCep.buscarPorCep.and.returnValue(of(respostaMock));
    component.formularioEndereco.patchValue({ cep: '00000-000' });

    component.aoAlterarCep();

    setTimeout(() => {
      expect(component.cepNaoEncontrado).toBeTruthy();
      concluido();
    }, 100);
  });

  it('deve salvar usuário quando todos os formulários forem válidos', () => {
    component.formularioDadosPessoais.patchValue({
      primeiroNome: 'João',
      ultimoNome: 'Silva',
      genero: 'M'
    });

    component.formularioEndereco.patchValue({
      cep: '01310-100',
      estado: 'SP',
      rua: 'Avenida Paulista',
      bairro: 'Bela Vista',
      numero: '100',
      complemento: 'Apto 50'
    });

    component.salvarUsuario();

    expect(servicoUsuario.adicionarUsuario).toHaveBeenCalled();
    expect(component.exibirDialogo).toBeTruthy();
  });
});