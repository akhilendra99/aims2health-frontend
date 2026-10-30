import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { PatientAuthService } from './patient-auth.service';

@Injectable()
export class PatientAuthGuard  {

    constructor(private authService: PatientAuthService, private router: Router){

    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        //throw new Error('Method not implemented.');
        const isAuth =this.authService.getIsAuth();
        if (!isAuth){
            return this.router.parseUrl('/plogin');
        }
        return true;
    }

}
