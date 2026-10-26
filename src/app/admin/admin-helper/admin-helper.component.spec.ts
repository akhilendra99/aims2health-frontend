import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminHelperComponent } from './admin-helper.component';

describe('AdminHelperComponent', () => {
  let component: AdminHelperComponent;
  let fixture: ComponentFixture<AdminHelperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminHelperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminHelperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
