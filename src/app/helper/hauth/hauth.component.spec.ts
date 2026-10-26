import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HauthComponent } from './hauth.component';

describe('HauthComponent', () => {
  let component: HauthComponent;
  let fixture: ComponentFixture<HauthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HauthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HauthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
