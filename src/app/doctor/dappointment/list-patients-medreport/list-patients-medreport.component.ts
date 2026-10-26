import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Post } from 'src/app/patient/pmedreport/pmedreport.model';
import { PmedReportService } from 'src/app/patient/pmedreport/pmedreport.service';
import { DappointmentService } from '../dappointment.service';

import { Pipe, PipeTransform} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-list-patients-medreport',
    templateUrl: './list-patients-medreport.component.html',
    styleUrls: ['./list-patients-medreport.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ListPatientsMedreportComponent implements OnInit, PipeTransform {

  posts: Post[] =[]
  patientId;
  patientName;
  private postsSub: Subscription;
  isLoading = false;
  totalPosts = 0;
  postPerPage= 5;
  currentPage = 1;
  pageSizeOptions = [1,2,5,10];
  private authStatusSub: Subscription;
  userIsAuthenticated = false;
  userId: number;

  displayedColumns: string[] = ['prescription_id', 'report_title', 'media_type', 'record_date', 'content', 'filePath'];
  prescriptions: any =[];
  OneLessPrescriptions: any =[];


  one_imagePath
  one_mediaType
  one_reportTitle

  currentModalFilePath;
  currentModalFileType;

  constructor(private sanitizer: DomSanitizer,public postsService: DappointmentService, public route: ActivatedRoute, private authService: AuthService ) {}
  // transform(value: any, ...args: any[]) {
  //   throw new Error('Method not implemented.');
  // }

  transform(url: string): SafeResourceUrl | null {
    try {
      const backendOrigin = new URL(environment.apiURL).origin;
      const resourceUrl = new URL(url, `${backendOrigin}/`);
      const path = decodeURIComponent(resourceUrl.pathname);
      const isBackendImage =
        resourceUrl.origin === backendOrigin &&
        resourceUrl.protocol === new URL(backendOrigin).protocol &&
        /^\/images\/[^/]+\.pdf$/i.test(path) &&
        !resourceUrl.username &&
        !resourceUrl.password &&
        !resourceUrl.search &&
        !resourceUrl.hash;

      return isBackendImage
        ? this.sanitizer.bypassSecurityTrustResourceUrl(resourceUrl.href)
        : null;
    } catch {
      return null;
    }
  }

  nextStep(): void {
    return
  }

  

  ngOnInit(): void { 

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if(paramMap.has('pFname')){
        this.patientName= paramMap.get('pFname');
      }
      if(paramMap.has('patientId')){
        this.patientId = paramMap.get('patientId');
        this.isLoading = true;
        this.postsService.getPMedReports(this.postPerPage, this.currentPage, this.patientId);
        this.isLoading = true;
        this.userId = this.authService.getUserId();
        this.postsSub = this.postsService.getPmedReportsUpdateListener()
        .subscribe((postData: {posts:Post[], postCount: number}) => {
          this.isLoading=false;
          this.posts = postData.posts;
          this.prescriptions = postData.posts;
          this.totalPosts = postData.postCount;

          this.one_imagePath= this.posts[0].imagePath
          this.one_mediaType= this.posts[0].mediaType
          this.one_reportTitle= this.posts[0].report_title

          // console.log("Posts:", this.posts)
          
        });

      }else{
        return;
      }

          this.OneLessPrescriptions =this.posts;
          this.OneLessPrescriptions.shift()
          this.OneLessPrescriptions=[this.OneLessPrescriptions]
          // console.log("One lessPosts: ", this.OneLessPrescriptions)

    });



    

    this.userIsAuthenticated= this.authService.getIsAuth()
    this.authStatusSub = this.authService.getAuthStatusListner().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
      this.userId = this.authService.getUserId();

    });
  }

  

  updateModalVariables(fileType, filePath){
    this.currentModalFilePath =filePath;
    this.currentModalFileType = fileType;
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }

  createRange(number){
    // return new Array(number);
    return new Array(number).fill(0)
      .map((n, index) => index + 1);
  }

  onChangedPage(pageData: PageEvent){
    //console.log(pageData);
    this.isLoading=true;
    this.currentPage = pageData.pageIndex+1;
    this.postPerPage = pageData.pageSize;
    this.postsService.getPMedReports(this.postPerPage, this.currentPage, this.patientId);
  }
  

}
