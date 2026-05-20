import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  const clonedReq = req.clone({
    withCredentials: true
  });

  return next(clonedReq);
};
