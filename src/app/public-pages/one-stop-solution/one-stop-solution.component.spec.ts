import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneStopSolutionComponent } from './one-stop-solution.component';

describe('OneStopSolutionComponent', () => {
  let component: OneStopSolutionComponent;
  let fixture: ComponentFixture<OneStopSolutionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OneStopSolutionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OneStopSolutionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
