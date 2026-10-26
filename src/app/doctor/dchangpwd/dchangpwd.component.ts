import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DChangePWDService } from './dchangpwd.service';
import { ToastrService } from 'ngx-toastr';


@Component({
    selector: 'app-dchangpwd',
    templateUrl: './dchangpwd.component.html',
    styleUrls: ['./dchangpwd.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DchangpwdComponent implements OnInit {


  isLoading = false;

  constructor(private apChgPwdService: DChangePWDService,  private toastr: ToastrService) { }

  ngOnInit(): void {
  }

  onSave(pwdForm){
    //console.log(pwdForm.form.value);

    if(pwdForm.form.value.password != pwdForm.form.value.password2 || pwdForm.form.value.password.length < 8 ||pwdForm.form.value.password.length > 16){
      //console.log("passwords incorrect!");
      this.toastr.error('Either passwords dont match or the length of password is not in between 8 and 16 characters.', 'Error!');
      return;
    }else{
      //console.log("send passwords to backend");

      this.apChgPwdService.updatePwd(pwdForm.form.value.oldPassword, pwdForm.form.value.password);
      
      this.isLoading = false;
    }
  }

}
