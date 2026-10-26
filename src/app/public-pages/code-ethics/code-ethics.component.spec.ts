import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodeEthicsComponent } from './code-ethics.component';

describe('CodeEthicsComponent', () => {
  let component: CodeEthicsComponent;
  let fixture: ComponentFixture<CodeEthicsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CodeEthicsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CodeEthicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
