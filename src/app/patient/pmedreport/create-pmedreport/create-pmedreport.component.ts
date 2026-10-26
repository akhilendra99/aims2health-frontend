import { Component, OnDestroy, OnInit, Output, ChangeDetectionStrategy } from '@angular/core';
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
  UntypedFormBuilder,
} from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Post } from '../pmedreport.model';
import { PmedReportService } from '../pmedreport.service';
import { mimeType } from './mime-type.validator';
import { ChartConfiguration, ChartType } from 'chart.js';
var moment = require('moment');

interface MediaItems {
  value: string;
  viewValue: string;
}

@Component({
    selector: 'app-create-pmedreport',
    templateUrl: './create-pmedreport.component.html',
    styleUrls: ['./create-pmedreport.component.css'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class CreatePmedreportComponent implements OnInit, OnDestroy {
  enteredContent = '';
  enteredTitle = '';
  isLoading = false;
  form: UntypedFormGroup;
  imagePreview: string;
  private mode = 'create';
  private postId: string;
  public post: Post;
  private authStatusSub: Subscription;
  maxDate;

  posts: Post[] = [];
  private postsSub: Subscription;
  totalPosts = 0;
  postPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated = false;
  userId: number;

  selectedMedia: string;

  media_types: MediaItems[] = [
    { value: 'na', viewValue: 'No Attachment' },
    { value: 'prescription', viewValue: 'Prescription' },
    { value: 'discharge_summary', viewValue: 'Discharge Summary' },
    { value: 'referral_note', viewValue: 'Referral Note' },
    { value: 'consent_photo', viewValue: 'Consent Photo' },
    { value: 'xray', viewValue: 'X-Ray' },
    { value: 'mri', viewValue: 'MRI' },
    { value: 'ecg', viewValue: 'ECG' },
    { value: 'lab_investigation', viewValue: 'Lab Investigation' },
    { value: 'other', viewValue: 'Other' },
  ];

  public doughnutChartLabels = ['Used Space', 'Free Space'];
  public doughnutChartData: number[] = [];
  public doughnutChartType: ChartType = 'doughnut';
  // ng2-charts v5 dropped the [colors] input; colors now live on the dataset.
  // `data` keeps the same array reference as doughnutChartData so in-place
  // mutations below stay reflected here without extra bookkeeping.
  public doughnutChartDatasets: ChartConfiguration<'doughnut'>['data']['datasets'] =
    [
      {
        data: this.doughnutChartData,
        backgroundColor: ['#6FC8CE', '#B9E8E0'],
      },
    ];

  uploadLimit;
  totalUpload;
  freeSpace;

  constructor(
    public postsService: PmedReportService,
    public route: ActivatedRoute,
    private authService: AuthService,
    private fb: UntypedFormBuilder
  ) {}

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();

    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }

  nextStep(): void {
    return;
  }

  onDelete(postId: string) {
    this.postsService.deleteReport(postId).subscribe(
      () => {
        this.postsService.getPosts(this.postPerPage, this.currentPage);
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  onChangedPage(pageData: PageEvent) {
    //console.log(pageData);
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postPerPage, this.currentPage);
  }

  ngOnInit() {
    this.form = this.fb.group({
      media_type: [''],
    });

    setTimeout(() => {
      this.form.get('media_type')?.setValue('na');
    }, 0);
    // Helper method to check if 'No Attachment' is selected

    this.maxDate = new Date().toISOString().slice(0, 10);

    this.authStatusSub = this.authService
      .getAuthStatusListner()
      .subscribe((authStatus) => {
        this.isLoading = false;
      });
    this.form = new UntypedFormGroup({
      title: new UntypedFormControl(null, {
        validators: [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
        ],
      }),
      content: new UntypedFormControl(null, {
        validators: [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
        ],
      }),
      image: new UntypedFormControl(null, {
        // validators: [Validators.required],
        //asyncValidators: [mimeType]
      }),
      media_type: new UntypedFormControl(null, {
        validators: [Validators.required],
      }),
      record_date: new UntypedFormControl(null, {
        validators: [Validators.required],
      }),
    });

    this.postsService.getPosts(this.postPerPage, this.currentPage);
    this.isLoading = true;
    this.userId = this.authService.getUserId();
    this.postsSub = this.postsService
      .getPostsUpdateListener()
      .subscribe((postData: { posts: Post[]; postCount: number }) => {
        this.isLoading = false;
        this.posts = postData.posts;
        this.totalPosts = postData.postCount;
      });

    // getting current total upload size
    this.totalUpload = this.postsService
      .getCurrentUpSize()
      .subscribe((postData) => {
        this.isLoading = false;
        this.totalUpload = postData;
        this.uploadLimit = postData;
        this.uploadLimit = this.uploadLimit.uploadLimit;

        this.totalUpload = this.totalUpload.currentSize;
        if (this.totalUpload == null) {
          this.totalUpload = 0.0;
        }
        this.freeSpace = this.uploadLimit - parseFloat(this.totalUpload);
        console.log('UploadLimit:', this.uploadLimit);
        console.log('totalUpload:', this.totalUpload);
        this.doughnutChartData[0] = this.roundOffNumbers(
          parseFloat(this.totalUpload)
        );
        this.doughnutChartData[1] = this.roundOffNumbers(this.freeSpace);
        console.log('free:', this.roundOffNumbers(this.freeSpace));
      });
    //end

    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSub = this.authService
      .getAuthStatusListner()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        this.postsService.getReport(this.postId).subscribe((postData) => {
          this.isLoading = false;
          this.post = {
            report_id: postData[0].report_id,
            report_title: postData[0].report_title,
            content: postData[0].content,
            imagePath: postData[0].imagePath,
            patient_id: postData[0].patient_id,
            mediaType: postData[0].mediaType,
            recordDate: postData[0].recordDate,
          };

          this.form.setValue({
            title: this.post.report_title,
            content: this.post.content,
            image: this.post.imagePath,
            media_type: this.post.mediaType,
            record_date: this.post.recordDate,
          });
        });

        // this.form.setValue({
        //   'title': this.post.title,
        //   'content': this.post.content,
        //   'image': this.post.imagePath
        // });
      } else {
        this.mode = 'create';
        this.postId = null;
      }
    });
  }
  isNoAttachmentSelected(): boolean {
    return this.form.get('media_type')?.value === 'na';
  }

  // onImagePicked(event: Event){
  //   const file = (event.target as HTMLInputElement).files[0];
  //   this.form.patchValue({image: file});
  //   this.form.get('image').updateValueAndValidity();
  //   const reader = new FileReader();
  //   reader.onload= () => {
  //     this.imagePreview = reader.result as string;
  //   }
  //   reader.readAsDataURL(file);
  //   // console.log(file);
  //   // console.log(this.form);
  // }

  roundOffNumbers(val: any) {
    let avar = Math.round((val + Number.EPSILON) * 100) / 100;
    if (Number.isNaN(avar)) {
      return 0;
    } else {
      return avar;
    }
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({ image: file });
    //////////
    this.form.get('image').clearValidators();
    this.form.get('image').setValidators([Validators.required]);
    this.form.get('image').setAsyncValidators([mimeType]);
    this.form.get('image').updateValueAndValidity();
    //////////
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();
    //reader.fileName = file.name
    reader.onload = () => {
      this.imagePreview = file.name as string;
    };
    reader.readAsDataURL(file);
    // console.log(file);
    // console.log(this.form);
  }

  onSavePost() {
    console.log('onSavePost() called');
    console.log('Form Values:', this.form.value);
    console.log('Form Valid:', this.form.valid);
    console.log('Image Type:', typeof this.form.value.image);

    if (this.form.invalid) {
      console.warn('Form is invalid', this.form.value);
      return;
    }
    if (this.form.invalid) {
      console.warn('Form is invalid', this.form.value);

      // 🔽 Log control-specific errors here
      Object.keys(this.form.controls).forEach((key) => {
        const controlErrors = this.form.get(key)?.errors;
        console.log(`${key} control errors:`, controlErrors);
      });

      return;
    }

    const momentDateVal = moment(this.form.value.record_date).format(
      'YYYY-MM-DD'
    );
    this.isLoading = true;

    if (this.mode === 'create') {
      if (this.form.value.media_type == 'na') {
        this.postsService
          .addReportWithoutImage(
            this.form.value.title,
            this.form.value.content,
            'na',
            this.form.value.media_type,
            momentDateVal
          )
          .subscribe({
            next: (res) => {
              this.onPostSuccess();
            },
            error: (err) => {
              console.error('Error:', err);
              this.isLoading = false;
            },
          });
      } else {
        this.postsService
          .addReport(
            this.form.value.title,
            this.form.value.content,
            this.form.value.image,
            this.form.value.media_type,
            momentDateVal
          )
          .subscribe({
            next: (res) => {
              this.onPostSuccess();
            },
            error: (err) => {
              console.error('Error:', err);
              this.isLoading = false;
            },
          });
      }
    } else {
      if (this.form.value.media_type == 'na') {
        this.postsService
          .updateReportWithoutImage(
            this.postId,
            this.form.value.title,
            this.form.value.content,
            'na',
            this.form.value.media_type,
            momentDateVal
          )
          .subscribe({
            next: (res) => {
              this.onPostSuccess();
            },
            error: (err) => {
              console.error('Error:', err);
              this.isLoading = false;
            },
          });
      } else {
        this.postsService
          .updateReport(
            this.postId,
            this.form.value.title,
            this.form.value.content,
            this.form.value.image,
            this.form.value.media_type,
            momentDateVal
          )
          .subscribe({
            next: (res) => {
              this.onPostSuccess();
            },
            error: (err) => {
              console.error('Error:', err);
              this.isLoading = false;
            },
          });
      }
    }
  }
  onPostSuccess() {
    this.isLoading = false;
    this.form.reset();
    console.log('Form submitted successfully');
  }
}
