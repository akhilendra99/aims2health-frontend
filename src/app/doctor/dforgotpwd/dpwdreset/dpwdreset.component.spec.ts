import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DpwdresetComponent } from './dpwdreset.component';

describe('DpwdresetComponent', () => {
  let component: DpwdresetComponent;
  let fixture: ComponentFixture<DpwdresetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DpwdresetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DpwdresetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
