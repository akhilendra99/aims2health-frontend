import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { DoctorAuthService } from './doctor-auth.service';

@Injectable()
export class DoctorAuthGuard  {

    constructor(private authService: DoctorAuthService, private router: Router){

    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        //throw new Error('Method not implemented.');
        const isAuth =this.authService.getIsAuth();
        if (!isAuth){
            return this.router.parseUrl('/dlogin');
        }
        return true;
    }

}
