import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceAndPaymentComponent } from './price-and-payment.component';

describe('PriceAndPaymentComponent', () => {
  let component: PriceAndPaymentComponent;
  let fixture: ComponentFixture<PriceAndPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriceAndPaymentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriceAndPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
