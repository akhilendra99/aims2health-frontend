import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPappointmentComponent } from './list-pappointment.component';

describe('ListPappointmentComponent', () => {
  let component: ListPappointmentComponent;
  let fixture: ComponentFixture<ListPappointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListPappointmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListPappointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
