import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaccountverifyComponent } from './paccountverify.component';

describe('PaccountverifyComponent', () => {
  let component: PaccountverifyComponent;
  let fixture: ComponentFixture<PaccountverifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaccountverifyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaccountverifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
