import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocPaymentsComponent } from './doc-payments.component';

describe('DocPaymentsComponent', () => {
  let component: DocPaymentsComponent;
  let fixture: ComponentFixture<DocPaymentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocPaymentsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocPaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
