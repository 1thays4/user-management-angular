import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputMaskModule } from 'primeng/inputmask';
import { TabsModule } from 'primeng/tabs';
import { Subject, takeUntil } from 'rxjs';

import { FORM_VALIDATION } from 'src/app/shared/constants/form-validation.constants';
import { CepValidator } from 'src/app/shared/validators/cep.validator';
import { User } from 'src/app/shared/models/user.model';
import { UserService } from 'src/app/core/services/user.service';
import { ViaCepService } from 'src/app/core/services/viacep.service';
import { GENDER_OPTIONS, GenderOption } from 'src/app/shared/models/gender.enum';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    Select,
    DialogModule,
    ToastModule,
    InputMaskModule,
    TabsModule
  ],
  providers: [MessageService],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit, OnDestroy {
  formularioDadosPessoais!: FormGroup;
  formularioEndereco!: FormGroup;
  exibirDialogo = false;
  usuarioSalvo: User | null = null;
  abaAtiva = 0;

  opcoesGenero: GenderOption[] = GENDER_OPTIONS;

  buscandoCep = false;
  cepNaoEncontrado = false;

  private destruir$ = new Subject<void>();
  private indiceEdicao: number | null = null;
  private modoEdicao = false;

  constructor(
    private construirFormulario: FormBuilder,
    private servicoUsuario: UserService,
    private servicoViaCep: ViaCepService,
    private servicoMensagem: MessageService,
    private roteador: Router
  ) {
    this.inicializarFormularios();
    const navegacao = this.roteador.getCurrentNavigation();
    if (navegacao?.extras.state) {
      const estado = navegacao.extras.state as { usuario: User; indice: number };
      this.modoEdicao = true;
      this.indiceEdicao = estado.indice;
      this.preencherFormulario(estado.usuario);
    }
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destruir$.next();
    this.destruir$.complete();
  }

  private inicializarFormularios(): void {
    this.formularioDadosPessoais = this.construirFormulario.group({
      primeiroNome: ['', [Validators.required, Validators.minLength(FORM_VALIDATION.NAME_MIN_LENGTH)]],
      ultimoNome: ['', [Validators.required, Validators.minLength(FORM_VALIDATION.NAME_MIN_LENGTH)]],
      genero: ['', Validators.required]
    });

    this.formularioEndereco = this.construirFormulario.group({
      cep: ['', [Validators.required, CepValidator.valido()]],
      estado: [{ value: '', disabled: true }, Validators.required],
      rua: [{ value: '', disabled: true }, Validators.required],
      bairro: [{ value: '', disabled: true }, Validators.required],
      numero: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      complemento: ['']
    });
  }

  proximoPasso(): void {
    if (this.formularioDadosPessoais.valid) {
      this.abaAtiva = 1;
    } else {
      this.servicoMensagem.add({
        severity: 'error',
        summary: 'Campos obrigatórios',
        detail: FORM_VALIDATION.MESSAGES.FILL_FIRST_TAB
      });
    }
  }

  aoAlterarCep(): void {
    const cep = this.formularioEndereco.get('cep')?.value;

    if (!cep) {
      this.limparCamposEndereco();
      return;
    }

    const cepLimpo = CepValidator.limparCep(cep);
    if (cepLimpo.length !== FORM_VALIDATION.CEP_LENGTH) {
      return;
    }

    this.buscandoCep = true;
    this.cepNaoEncontrado = false;
    this.limparCamposEndereco();

    this.servicoViaCep.buscarPorCep(cep)
      .pipe(takeUntil(this.destruir$))
      .subscribe({
      next: (resposta) => {
        this.buscandoCep = false;

        if (resposta.erro) {
          this.cepNaoEncontrado = true;
          this.limparCamposEndereco();
          this.formularioEndereco.get('cep')?.setErrors({ cepInvalido: true });
          this.servicoMensagem.add({
            severity: 'error',
            summary: 'CEP não encontrado',
            detail: FORM_VALIDATION.MESSAGES.CEP_NOT_FOUND
          });
          return;
        }

        this.formularioEndereco.get('cep')?.setErrors(null);
        this.preencherEndereco(resposta);
        this.servicoMensagem.add({
          severity: 'success',
          summary: 'CEP encontrado',
          detail: FORM_VALIDATION.MESSAGES.CEP_FOUND
        });
      },
      error: (erro) => {
        this.buscandoCep = false;
        this.cepNaoEncontrado = true;
        this.limparCamposEndereco();
        this.formularioEndereco.get('cep')?.setErrors({ cepInvalido: true });
        this.servicoMensagem.add({
          severity: 'error',
          summary: 'Erro ao consultar CEP',
          detail: FORM_VALIDATION.MESSAGES.CEP_ERROR
        });
      }
    });
  }

  private preencherEndereco(resposta: any): void {
    this.formularioEndereco.patchValue({
      estado: resposta.uf,
      rua: resposta.logradouro,
      bairro: resposta.bairro
    });
  }

  private limparCamposEndereco(): void {
    this.formularioEndereco.patchValue({
      estado: '',
      rua: '',
      bairro: ''
    });
  }

  salvarUsuario(): void {
    if (!this.formularioDadosPessoais.valid || !this.formularioEndereco.valid) {
      this.servicoMensagem.add({
        severity: 'error',
        summary: 'Campos obrigatórios',
        detail: FORM_VALIDATION.MESSAGES.REQUIRED_FIELDS
      });
      return;
    }

    const usuario: User = {
      firstName: this.formularioDadosPessoais.get('primeiroNome')?.value,
      lastName: this.formularioDadosPessoais.get('ultimoNome')?.value,
      gender: this.formularioDadosPessoais.get('genero')?.value,
      address: {
        cep: this.formularioEndereco.get('cep')?.value,
        state: this.formularioEndereco.get('estado')?.value,
        street: this.formularioEndereco.get('rua')?.value,
        neighborhood: this.formularioEndereco.get('bairro')?.value,
        number: this.formularioEndereco.get('numero')?.value,
        complement: this.formularioEndereco.get('complemento')?.value || ''
      }
    };

    if (this.modoEdicao && this.indiceEdicao !== null) {
      this.servicoUsuario.atualizarUsuario(this.indiceEdicao, usuario);
      this.servicoMensagem.add({
        severity: 'success',
        summary: 'Usuário atualizado',
        detail: 'Os dados foram atualizados com sucesso!'
      });
    } else {
      this.servicoUsuario.adicionarUsuario(usuario);
      this.servicoMensagem.add({
        severity: 'success',
        summary: 'Usuário cadastrado',
        detail: FORM_VALIDATION.MESSAGES.USER_SAVED
      });
    }

    this.usuarioSalvo = usuario;
    this.exibirDialogo = true;
  }

  fecharDialogo(): void {
    this.exibirDialogo = false;
    this.roteador.navigate(['/lista']);
  }

  private preencherFormulario(usuario: User): void {
    this.formularioDadosPessoais.patchValue({
      primeiroNome: usuario.firstName,
      ultimoNome: usuario.lastName,
      genero: usuario.gender
    });

    this.formularioEndereco.patchValue({
      cep: usuario.address.cep,
      estado: usuario.address.state,
      rua: usuario.address.street,
      bairro: usuario.address.neighborhood,
      numero: usuario.address.number,
      complemento: usuario.address.complement
    });
  }

  obterRotuloGenero(valor: string): string {
    const opcao = this.opcoesGenero.find(opt => opt.value === valor);
    return opcao ? opcao.label : valor;
  }
}
