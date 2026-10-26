import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDappointmentComponent } from './list-dappointment.component';

describe('ListDappointmentComponent', () => {
  let component: ListDappointmentComponent;
  let fixture: ComponentFixture<ListDappointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListDappointmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListDappointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
