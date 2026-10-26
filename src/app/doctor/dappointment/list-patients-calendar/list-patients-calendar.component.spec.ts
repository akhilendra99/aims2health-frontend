import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPatientsCalendarComponent } from './list-patients-calendar.component';

describe('ListPatientsCalendarComponent', () => {
  let component: ListPatientsCalendarComponent;
  let fixture: ComponentFixture<ListPatientsCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListPatientsCalendarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListPatientsCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
