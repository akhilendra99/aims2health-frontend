import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PconsentComponent } from './pconsent.component';

describe('PconsentComponent', () => {
  let component: PconsentComponent;
  let fixture: ComponentFixture<PconsentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PconsentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PconsentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
