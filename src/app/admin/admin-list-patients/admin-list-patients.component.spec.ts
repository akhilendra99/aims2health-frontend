import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminListPatientsComponent } from './admin-list-patients.component';

describe('AdminListPatientsComponent', () => {
  let component: AdminListPatientsComponent;
  let fixture: ComponentFixture<AdminListPatientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminListPatientsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminListPatientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
