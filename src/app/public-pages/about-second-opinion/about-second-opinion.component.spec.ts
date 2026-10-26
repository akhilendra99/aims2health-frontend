import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutSecondOpinionComponent } from './about-second-opinion.component';

describe('AboutSecondOpinionComponent', () => {
  let component: AboutSecondOpinionComponent;
  let fixture: ComponentFixture<AboutSecondOpinionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AboutSecondOpinionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutSecondOpinionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
