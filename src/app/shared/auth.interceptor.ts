import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { AppComponent } from '../app.component';



@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshingToken = false;

  constructor(
    private readonly router: Router,
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = '63ac6382ff929d110a08cbf9';
    request = request.clone({
      url: request.url,
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next.handle(request);
  }
}
