import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { LocalStorageService } from './storage.service';
import { User } from '../../shared/models/user.model';

describe('UserService', () => {
  let servico: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService, LocalStorageService]
    });
    servico = TestBed.inject(UserService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('deve ser criado', () => {
    expect(servico).toBeTruthy();
  });

  it('deve adicionar um usuário', (concluido) => {
    const usuarioMock: User = {
      firstName: 'João',
      lastName: 'Silva',
      gender: 'M',
      address: {
        cep: '01310-100',
        state: 'SP',
        street: 'Avenida Paulista',
        neighborhood: 'Bela Vista',
        number: '100',
        complement: 'Apto 50'
      }
    };

    servico.adicionarUsuario(usuarioMock);

    servico.obterUsuarios().subscribe(usuarios => {
      expect(usuarios.length).toBe(1);
      expect(usuarios[0].firstName).toBe('João');
      concluido();
    });
  });

  it('deve persistir usuários no localStorage', () => {
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

    servico.adicionarUsuario(usuarioMock);

    const usuariosArmazenados = localStorage.getItem('users');
    expect(usuariosArmazenados).toBeTruthy();
    expect(JSON.parse(usuariosArmazenados!).length).toBe(1);
  });

  it('deve carregar usuários do localStorage na inicialização', () => {
    const usuariosMock: User[] = [{
      firstName: 'Carlos',
      lastName: 'Oliveira',
      gender: 'M',
      address: {
        cep: '20040-020',
        state: 'RJ',
        street: 'Avenida Rio Branco',
        neighborhood: 'Centro',
        number: '300'
      }
    }];

    localStorage.setItem('users', JSON.stringify(usuariosMock));
    
    const servicoArmazenamento = TestBed.inject(LocalStorageService);
    const novoServico = new UserService(servicoArmazenamento);
    
    novoServico.obterUsuarios().subscribe(usuarios => {
      expect(usuarios.length).toBe(1);
      expect(usuarios[0].firstName).toBe('Carlos');
    });
  });

  it('deve lidar com múltiplos usuários', (concluido) => {
    const usuario1: User = {
      firstName: 'Ana',
      lastName: 'Costa',
      gender: 'F',
      address: { cep: '01310-100', state: 'SP', street: 'Rua A', neighborhood: 'Bairro A', number: '1' }
    };

    const usuario2: User = {
      firstName: 'Pedro',
      lastName: 'Lima',
      gender: 'M',
      address: { cep: '20040-020', state: 'RJ', street: 'Rua B', neighborhood: 'Bairro B', number: '2' }
    };

    servico.adicionarUsuario(usuario1);
    servico.adicionarUsuario(usuario2);

    servico.obterUsuarios().subscribe(usuarios => {
      expect(usuarios.length).toBe(2);
      expect(usuarios[0].firstName).toBe('Ana');
      expect(usuarios[1].firstName).toBe('Pedro');
      concluido();
    });
  });
});
