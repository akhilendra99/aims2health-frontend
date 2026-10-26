import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PauthComponent } from './pauth.component';

describe('PauthComponent', () => {
  let component: PauthComponent;
  let fixture: ComponentFixture<PauthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PauthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PauthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
