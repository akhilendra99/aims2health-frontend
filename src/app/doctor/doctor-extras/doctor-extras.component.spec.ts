import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorExtrasComponent } from './doctor-extras.component';

describe('DoctorExtrasComponent', () => {
  let component: DoctorExtrasComponent;
  let fixture: ComponentFixture<DoctorExtrasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DoctorExtrasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorExtrasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
