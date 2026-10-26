import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HloginComponent } from './hlogin.component';

describe('HloginComponent', () => {
  let component: HloginComponent;
  let fixture: ComponentFixture<HloginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HloginComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HloginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
