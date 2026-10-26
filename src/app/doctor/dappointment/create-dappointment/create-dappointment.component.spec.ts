import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDappointmentComponent } from './create-dappointment.component';

describe('CreateDappointmentComponent', () => {
  let component: CreateDappointmentComponent;
  let fixture: ComponentFixture<CreateDappointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateDappointmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateDappointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
