import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DprofileComponent } from './dprofile.component';

describe('DprofileComponent', () => {
  let component: DprofileComponent;
  let fixture: ComponentFixture<DprofileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DprofileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DprofileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
