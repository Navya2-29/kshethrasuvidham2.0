import { HttpInterceptorFn } from '@angular/common/http';

export const headerInterceptor: HttpInterceptorFn = (req, next) => {

    const modifiedReq = req.clone({ 
      setHeaders: {
        'Accept': '*/*',
        'apitoken': '12345',
        'Content-Type':'application/json'
      }
    });
    return next(modifiedReq);
 
};
