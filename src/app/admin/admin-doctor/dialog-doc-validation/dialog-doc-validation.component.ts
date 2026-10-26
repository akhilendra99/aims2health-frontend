import { Component, Inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdminService } from '../../admin.service';

@Component({
    selector: 'app-dialog-doc-validation',
    templateUrl: './dialog-doc-validation.component.html',
    styleUrls: ['./dialog-doc-validation.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class DialogDocValidationComponent implements OnInit {

  constructor(public dialog: MatDialog, private adminService: AdminService, @Inject(MAT_DIALOG_DATA) public data: {message: string, docEmail: string}) { }

  ngOnInit(): void {
  }

  validateDoc(docEmail: string){
    //console.log("Doc email to validate:", docEmail);
    this.adminService.validateDoc(docEmail);
  }

}
