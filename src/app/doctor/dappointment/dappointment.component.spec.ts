import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DappointmentComponent } from './dappointment.component';

describe('DappointmentComponent', () => {
  let component: DappointmentComponent;
  let fixture: ComponentFixture<DappointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DappointmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DappointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
