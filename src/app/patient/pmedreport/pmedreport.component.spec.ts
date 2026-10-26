import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PmedreportComponent } from './pmedreport.component';

describe('PmedreportComponent', () => {
  let component: PmedreportComponent;
  let fixture: ComponentFixture<PmedreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PmedreportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PmedreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
