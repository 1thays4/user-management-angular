import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const interceptadorErro: HttpInterceptorFn = (requisicao, proximo) => {
  return proximo(requisicao).pipe(
    catchError((erro) => {
      console.error('Erro HTTP:', erro);
      return throwError(() => erro);
    })
  );
};
