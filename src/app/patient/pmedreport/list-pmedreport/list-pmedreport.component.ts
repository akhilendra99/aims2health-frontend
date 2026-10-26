import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Post } from '../pmedreport.model';
import { PmedReportService } from '../pmedreport.service';

@Component({
    selector: 'app-list-pmedreport',
    templateUrl: './list-pmedreport.component.html',
    styleUrls: ['./list-pmedreport.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class ListPmedreportComponent implements OnInit {
  posts: Post[] =[]
  private postsSub: Subscription;
  isLoading = false;
  totalPosts = 0;
  postPerPage= 5;
  currentPage = 1;
  pageSizeOptions = [1,2,5,10];
  private authStatusSub: Subscription;
  userIsAuthenticated = false;
  userId: number;


  constructor(public postsService: PmedReportService, private authService: AuthService ) {}



  nextStep(): void {
    return
  }

  ngOnInit(): void { 
    this.postsService.getPosts(this.postPerPage, this.currentPage);
    this.isLoading = true;
    this.userId = this.authService.getUserId();
    this.postsSub = this.postsService.getPostsUpdateListener()
    .subscribe((postData: {posts:Post[], postCount: number}) => {
      this.isLoading=false;
      this.posts = postData.posts;
      this.totalPosts = postData.postCount;
      
    });

    this.userIsAuthenticated= this.authService.getIsAuth()
    this.authStatusSub = this.authService.getAuthStatusListner().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
      this.userId = this.authService.getUserId();

    });
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }

  onDelete(postId: string){
    this.postsService.deleteReport(postId)
    .subscribe(() => {
      this.postsService.getPosts(this.postPerPage, this.currentPage);
    }, () => {
      this.isLoading = false; 
    });
  }

  onChangedPage(pageData: PageEvent){
    //console.log(pageData);
    this.isLoading=true;
    this.currentPage = pageData.pageIndex+1;
    this.postPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postPerPage, this.currentPage);
  }
  

}
