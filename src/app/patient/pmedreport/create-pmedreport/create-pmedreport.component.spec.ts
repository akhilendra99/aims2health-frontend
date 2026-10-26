import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePmedreportComponent } from './create-pmedreport.component';

describe('CreatePmedreportComponent', () => {
  let component: CreatePmedreportComponent;
  let fixture: ComponentFixture<CreatePmedreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreatePmedreportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePmedreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
