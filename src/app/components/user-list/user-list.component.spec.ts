import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';

import { UserListComponent } from './user-list.component';
import { UserService } from '../../core/services/user.service';
import { User } from '../../shared/models/user.model';

describe('UserListComponent', () => {
  let componente: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let servicoUsuario: jasmine.SpyObj<UserService>;
  let roteador: jasmine.SpyObj<Router>;
  let servicoMensagem: jasmine.SpyObj<MessageService>;
  let servicoConfirmacao: jasmine.SpyObj<ConfirmationService>;

  beforeEach(async () => {
    const userServiceSpy = jasmine.createSpyObj('UserService', ['obterUsuarios', 'excluirUsuario']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);
    const confirmationServiceSpy = jasmine.createSpyObj('ConfirmationService', ['confirm']);

    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: ConfirmationService, useValue: confirmationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    componente = fixture.componentInstance;
    servicoUsuario = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    roteador = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    servicoMensagem = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    servicoConfirmacao = TestBed.inject(ConfirmationService) as jasmine.SpyObj<ConfirmationService>;

    servicoUsuario.obterUsuarios.and.returnValue(of([]));
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(componente).toBeTruthy();
  });

  it('deve carregar usuários na inicialização', () => {
    const usuariosMock: User[] = [{
      firstName: 'João',
      lastName: 'Silva',
      gender: 'M',
      address: {
        cep: '01310-100',
        state: 'SP',
        street: 'Avenida Paulista',
        neighborhood: 'Bela Vista',
        number: '100'
      }
    }];

    servicoUsuario.obterUsuarios.and.returnValue(of(usuariosMock));
    componente.carregarUsuarios();

    expect(componente.usuarios.length).toBe(1);
    expect(componente.usuarios[0].firstName).toBe('João');
  });

  it('deve navegar para cadastro ao criar novo usuário', () => {
    componente.novoUsuario();
    expect(roteador.navigate).toHaveBeenCalledWith(['/cadastro']);
  });

  it('deve navegar para edição com dados do usuário', () => {
    const usuarioMock: User = {
      firstName: 'Maria',
      lastName: 'Santos',
      gender: 'F',
      address: {
        cep: '01310-100',
        state: 'SP',
        street: 'Avenida Paulista',
        neighborhood: 'Bela Vista',
        number: '200'
      }
    };

    componente.editarUsuario(usuarioMock, 0);
    expect(roteador.navigate).toHaveBeenCalledWith(['/cadastro'], { state: { usuario: usuarioMock, indice: 0 } });
  });

  it('deve obter rótulo do gênero corretamente', () => {
    expect(componente.obterRotuloGenero('M')).toBe('Masculino');
    expect(componente.obterRotuloGenero('F')).toBe('Feminino');
    expect(componente.obterRotuloGenero('O')).toBe('Outro');
  });
});
