import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';


import { GENDER_OPTIONS } from 'src/app/shared/models/gender.enum';
import { User } from 'src/app/shared/models/user.model';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {
  usuarios: User[] = [];
  private destruir$ = new Subject<void>();

  constructor(
    private servicoUsuario: UserService,
    private roteador: Router,
    private servicoMensagem: MessageService,
    private servicoConfirmacao: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  ngOnDestroy(): void {
    this.destruir$.next();
    this.destruir$.complete();
  }

  carregarUsuarios(): void {
    this.servicoUsuario.obterUsuarios()
      .pipe(takeUntil(this.destruir$))
      .subscribe(usuarios => {
        this.usuarios = usuarios;
      });
  }

  obterRotuloGenero(valor: string): string {
    const opcao = GENDER_OPTIONS.find(opt => opt.value === valor);
    return opcao ? opcao.label : valor;
  }

  editarUsuario(usuario: User, indice: number): void {
    this.roteador.navigate(['/cadastro'], { state: { usuario, indice } });
  }

  excluirUsuario(usuario: User, indice: number): void {
    this.servicoConfirmacao.confirm({
      message: `Deseja realmente excluir ${usuario.firstName} ${usuario.lastName}?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.servicoUsuario.excluirUsuario(indice);
        this.servicoMensagem.add({
          severity: 'success',
          summary: 'Usuário excluído',
          detail: 'Usuário removido com sucesso!'
        });
      }
    });
  }

  novoUsuario(): void {
    this.roteador.navigate(['/cadastro']);
  }
}
