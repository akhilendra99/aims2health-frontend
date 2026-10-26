import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthDialogBoxComponent } from './auth-dialog-box.component';

describe('AuthDialogBoxComponent', () => {
  let component: AuthDialogBoxComponent;
  let fixture: ComponentFixture<AuthDialogBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuthDialogBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AuthDialogBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
