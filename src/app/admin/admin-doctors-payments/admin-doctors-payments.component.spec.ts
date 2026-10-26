import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDoctorsPaymentsComponent } from './admin-doctors-payments.component';

describe('AdminDoctorsPaymentsComponent', () => {
  let component: AdminDoctorsPaymentsComponent;
  let fixture: ComponentFixture<AdminDoctorsPaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminDoctorsPaymentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminDoctorsPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
