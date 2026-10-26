import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DchangpwdComponent } from './dchangpwd.component';

describe('DchangpwdComponent', () => {
  let component: DchangpwdComponent;
  let fixture: ComponentFixture<DchangpwdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DchangpwdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DchangpwdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
