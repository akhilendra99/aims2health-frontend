import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DauthComponent } from './dauth.component';

describe('DauthComponent', () => {
  let component: DauthComponent;
  let fixture: ComponentFixture<DauthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DauthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DauthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
