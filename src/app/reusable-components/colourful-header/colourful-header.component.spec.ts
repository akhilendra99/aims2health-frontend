/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColourfulHeaderComponent } from './colourful-header.component';

describe('ColourfulHeaderComponent', () => {
  let component: ColourfulHeaderComponent;
  let fixture: ComponentFixture<ColourfulHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColourfulHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ColourfulHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
