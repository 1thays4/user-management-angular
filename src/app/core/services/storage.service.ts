import { Injectable } from '@angular/core';

export interface IServicoArmazenamento {
  obter<T>(chave: string): T | null;
  definir<T>(chave: string, valor: T): void;
}

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService implements IServicoArmazenamento {
  obter<T>(chave: string): T | null {
    const armazenado = localStorage.getItem(chave);
    return armazenado ? JSON.parse(armazenado) : null;
  }

  definir<T>(chave: string, valor: T): void {
    localStorage.setItem(chave, JSON.stringify(valor));
  }
}
