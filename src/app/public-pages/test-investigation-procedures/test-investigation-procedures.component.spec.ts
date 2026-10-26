import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestInvestigationProceduresComponent } from './test-investigation-procedures.component';

describe('TestInvestigationProceduresComponent', () => {
  let component: TestInvestigationProceduresComponent;
  let fixture: ComponentFixture<TestInvestigationProceduresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestInvestigationProceduresComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestInvestigationProceduresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
