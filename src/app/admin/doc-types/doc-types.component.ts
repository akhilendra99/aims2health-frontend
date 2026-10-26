import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { AdminAuthService } from '../admin-auth/admin-auth.service';
import { AdminService } from '../admin.service';

@Component({
    selector: 'app-doc-types',
    templateUrl: './doc-types.component.html',
    styleUrls: ['./doc-types.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DocTypesComponent implements OnInit {

  isLoading = false;
  totalPosts = 0;
  postPerPage= 5;
  currentPage = 1;
  pageSizeOptions = [1,2,5,10];
  private authStatusSub: Subscription;
  userIsAuthenticated = false;
  userId: number;
  posts: any[] = [];

  displayedColumns: string[] = ['id', 'doc_type', 'name', 'regno', 'email_id', 'mobile', 'validate'];


  constructor(public adminService: AdminService, private authService: AdminAuthService, private toastr: ToastrService) { }

  ngOnInit(): void {

    this.isLoading=true;

    this.adminService.listDoctorTypes()
    .subscribe((postData: any) => {
      this.isLoading=false;
      
      this.posts = postData.post;
      
      console.log(this.posts);
    });
  }

  validateDoc(docEmail: string){
    //console.log("Doc email to validate:", docEmail);
    this.adminService.validateDoc(docEmail);
  }

  onSave(docTypeForm){
    //console.log(docTypeForm.form.value);

    if(docTypeForm.form.value.doctype.length > 25 ){
      //console.log("passwords incorrect!");
      this.toastr.error('The Length is too long!', 'Error!');
      return;
    }else{
      //console.log("send passwords to backend");

      this.adminService.createNewDocType(docTypeForm.form.value.doctype);
      
      this.isLoading = false;
    }
  }

  updateDoctype(updatedDocType: string, existingValue: string){
    if(updatedDocType == "" || updatedDocType.length >25){

      this.toastr.error('The doctor type field is either empty or the length is more than 25 characters! Please enter a valid value.', 'Error!');
      return;
    }else{
      //console.log("Updated doc type view value:", updatedDocType);
      this.adminService.updateDocType(updatedDocType, existingValue);
      
      this.isLoading = false;
    }
    
  }

  deleteDocType(docTypeToBeDeleted: string){
    //console.log("To be deleted doc type value:", docTypeToBeDeleted);
    this.adminService.deleteDocType(docTypeToBeDeleted);
      
      this.isLoading = false;
  }

}
