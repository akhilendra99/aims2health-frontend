import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoConsultancyComponent } from './video-consultancy.component';

describe('VideoConsultancyComponent', () => {
  let component: VideoConsultancyComponent;
  let fixture: ComponentFixture<VideoConsultancyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoConsultancyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoConsultancyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
