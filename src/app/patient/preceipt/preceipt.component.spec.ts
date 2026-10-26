import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreceiptComponent } from './preceipt.component';

describe('PreceiptComponent', () => {
  let component: PreceiptComponent;
  let fixture: ComponentFixture<PreceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreceiptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
