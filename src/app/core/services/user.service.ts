import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LocalStorageService } from './storage.service';
import { User } from 'src/app/shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usuarios: User[] = [];
  private usuariosSubject = new BehaviorSubject<User[]>([]);
  private readonly CHAVE_ARMAZENAMENTO = 'users';

  constructor(private armazenamento: LocalStorageService) {
    this.carregarUsuarios();
  }

  obterUsuarios(): Observable<User[]> {
    return this.usuariosSubject.asObservable();
  }

  adicionarUsuario(usuario: User): void {
    this.usuarios.push(usuario);
    this.usuariosSubject.next([...this.usuarios]);
    this.salvarUsuarios();
  }

  atualizarUsuario(indice: number, usuario: User): void {
    this.usuarios[indice] = usuario;
    this.usuariosSubject.next([...this.usuarios]);
    this.salvarUsuarios();
  }

  excluirUsuario(indice: number): void {
    this.usuarios.splice(indice, 1);
    this.usuariosSubject.next([...this.usuarios]);
    this.salvarUsuarios();
  }

  private salvarUsuarios(): void {
    this.armazenamento.definir(this.CHAVE_ARMAZENAMENTO, this.usuarios);
  }

  private carregarUsuarios(): void {
    const armazenado = this.armazenamento.obter<User[]>(this.CHAVE_ARMAZENAMENTO);
    if (armazenado) {
      this.usuarios = armazenado;
      this.usuariosSubject.next([...this.usuarios]);
    }
  }
}
