import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlankHeaderComponent } from './blank-header.component';

describe('BlankHeaderComponent', () => {
  let component: BlankHeaderComponent;
  let fixture: ComponentFixture<BlankHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlankHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlankHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
