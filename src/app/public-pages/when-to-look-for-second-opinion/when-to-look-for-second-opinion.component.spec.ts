import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WhenToLookForSecondOpinionComponent } from './when-to-look-for-second-opinion.component';

describe('WhenToLookForSecondOpinionComponent', () => {
  let component: WhenToLookForSecondOpinionComponent;
  let fixture: ComponentFixture<WhenToLookForSecondOpinionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WhenToLookForSecondOpinionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WhenToLookForSecondOpinionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
