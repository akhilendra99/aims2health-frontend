import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminListDoctorsComponent } from './admin-list-doctors.component';

describe('AdminListDoctorsComponent', () => {
  let component: AdminListDoctorsComponent;
  let fixture: ComponentFixture<AdminListDoctorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminListDoctorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminListDoctorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
