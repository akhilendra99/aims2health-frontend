import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePappointmentComponent } from './create-pappointment.component';

describe('CreatePappointmentComponent', () => {
  let component: CreatePappointmentComponent;
  let fixture: ComponentFixture<CreatePappointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreatePappointmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePappointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
