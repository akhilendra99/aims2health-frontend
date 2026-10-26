import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorsprofileComponent } from './doctorsprofile.component';

describe('DoctorsprofileComponent', () => {
  let component: DoctorsprofileComponent;
  let fixture: ComponentFixture<DoctorsprofileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoctorsprofileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorsprofileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
