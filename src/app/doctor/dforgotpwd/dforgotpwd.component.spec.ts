import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DforgotpwdComponent } from './dforgotpwd.component';

describe('DforgotpwdComponent', () => {
  let component: DforgotpwdComponent;
  let fixture: ComponentFixture<DforgotpwdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DforgotpwdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DforgotpwdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
