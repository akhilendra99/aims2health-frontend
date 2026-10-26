import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HsignupComponent } from './hsignup.component';

describe('HsignupComponent', () => {
  let component: HsignupComponent;
  let fixture: ComponentFixture<HsignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HsignupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HsignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
