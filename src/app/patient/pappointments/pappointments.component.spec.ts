import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PappointmentsComponent } from './pappointments.component';

describe('PappointmentsComponent', () => {
  let component: PappointmentsComponent;
  let fixture: ComponentFixture<PappointmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PappointmentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PappointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
