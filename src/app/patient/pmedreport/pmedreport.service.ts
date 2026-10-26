import { Post } from './pmedreport.model';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PmedReportService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[]; postCount: number }>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string; posts: Post[]; maxPosts: number }>(
        environment.apiURL + `/patient/medreports${queryParams}`
      )
      .subscribe((postData) => {
        this.posts = postData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: postData.maxPosts,
        });
      });
  }

  getCurrentUpSize() {
    //return this.http.get<[{message: string, currentSize: string}]>(environment.apiURL+`/patient/currentMedReportTotal`)
    return this.http.get<
      [{ message: string; currentSize: any; uploadLimit: any }]
    >(environment.apiURL + `/patient/currentMedReportTotal`);
  }

  getPostsUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getReport(id: string) {
    return this.http.get<
      [
        {
          report_id: string;
          report_title: string;
          content: string;
          imagePath: string;
          mediaType: string;
          patient_id: number;
          recordDate: string;
        }
      ]
    >(environment.apiURL + `/patient/medreports/${id}`);
  }

  addReport(
    title: string,
    content: string,
    image: File,
    mediaType: string,
    recordDate: string
  ): Observable<{ message: string; post: { imagePath: string } }> {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    postData.append('mediaType', mediaType);
    postData.append('recordDate', recordDate);

    return this.http.post<{ message: string; post: { imagePath: string } }>(
      `${environment.apiURL}/patient/medreport`,
      postData
    );
  }

  addReportWithoutImage(
    title: string,
    content: string,
    image: string,
    mediaType: string,
    recordDate: string
  ): Observable<any> {
    const postData = {
      title: title,
      content: content,
      image: image,
      mediaType: mediaType,
      recordDate: recordDate,
    };

    return this.http.post<any>(
      `${environment.apiURL}/patient/medreportwoimage`,
      postData
    );
  }

  updateReport(
    id: string,
    title: string,
    content: string,
    image: File | string,
    mediaType: string,
    recordDate: string
  ): Observable<any> {
    let postData;

    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
      postData.append('mediaType', mediaType);
      postData.append('recordDate', recordDate);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        image: image,
        mediaType: mediaType,
        recordDate: recordDate,
        creator: null,
      };
    }

    return this.http.put<any>(
      `${environment.apiURL}/patient/medreport/${id}`,
      postData
    );
  }

  updateReportWithoutImage(
    id: string,
    title: string,
    content: string,
    image: string,
    mediaType: string,
    recordDate: string
  ): Observable<any> {
    let postData;

    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image);
      postData.append('mediaType', mediaType);
      postData.append('recordDate', recordDate);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        image: image,
        mediaType: mediaType,
        recordDate: recordDate,
        creator: null,
      };
    }

    return this.http.put<any>(
      `${environment.apiURL}/patient/medreportwoimage/${id}`,
      postData
    );
  }

  deleteReport(postId: string) {
    return this.http.delete<{ message: string }>(
      environment.apiURL + `/patient/medrecords/${postId}`
    );
    // .subscribe(()=> {
    //     console.log('Deleted');
    //     const updatedPosts = this.posts.filter(post => post.id != postId)
    //     this.posts = updatedPosts;
    //     this.postsUpdated.next([...this.posts]);
    // });
  }
}
