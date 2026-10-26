import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpcomingAppointmentComponent } from './upcoming-appointment.component';

describe('UpcomingAppointmentComponent', () => {
  let component: UpcomingAppointmentComponent;
  let fixture: ComponentFixture<UpcomingAppointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpcomingAppointmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpcomingAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
