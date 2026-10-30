import {Injectable} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';



@Injectable({providedIn: 'root'})
export class PChangePWDService{

    private searchedResults: any[] = [];
    private searchResultsUpdated = new Subject<{searchedResults: any[]}>()

    private pmedprescriptionsUpdated = new Subject<{posts:any[]}>()
    private pmedprescriptions: any[] = [];

    constructor(private http: HttpClient, private router: Router,  private toastr: ToastrService ){

    }


    updatePwd(oldpwd: string, newpwd: string): Observable<any>{
        //const post: Post = {id: id, title: title, content: content, imagePath: null};
        let postData;
        
        postData ={
            oldpwd: oldpwd, 
            newpwd: newpwd
        }
        
        return this.http.put(environment.apiURL+`/patient/chpwd`, postData);

    }

}
