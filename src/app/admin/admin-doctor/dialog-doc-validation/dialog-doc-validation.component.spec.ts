import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDocValidationComponent } from './dialog-doc-validation.component';

describe('DialogDocValidationComponent', () => {
  let component: DialogDocValidationComponent;
  let fixture: ComponentFixture<DialogDocValidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DialogDocValidationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogDocValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
