import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListPmedreportComponent } from './list-pmedreport.component';

describe('ListPmedreportComponent', () => {
  let component: ListPmedreportComponent;
  let fixture: ComponentFixture<ListPmedreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListPmedreportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListPmedreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
