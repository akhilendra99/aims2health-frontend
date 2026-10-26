import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePatientPrescriptionComponent } from './create-patient-prescription.component';

describe('CreatePatientPrescriptionComponent', () => {
  let component: CreatePatientPrescriptionComponent;
  let fixture: ComponentFixture<CreatePatientPrescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreatePatientPrescriptionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePatientPrescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
