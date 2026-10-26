import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PchangpwdComponent } from './pchangpwd.component';

describe('PchangpwdComponent', () => {
  let component: PchangpwdComponent;
  let fixture: ComponentFixture<PchangpwdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PchangpwdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PchangpwdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
