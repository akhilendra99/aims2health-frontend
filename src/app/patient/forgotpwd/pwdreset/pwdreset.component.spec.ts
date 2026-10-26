import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PwdresetComponent } from './pwdreset.component';

describe('PwdresetComponent', () => {
  let component: PwdresetComponent;
  let fixture: ComponentFixture<PwdresetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PwdresetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PwdresetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
