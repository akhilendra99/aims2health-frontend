import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NotFoundComponent } from './not-found.component';
import { routes } from '../../app-routing.module';

describe('NotFoundComponent', () => {
  let component: NotFoundComponent;
  let fixture: ComponentFixture<NotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotFoundComponent],
      imports: [RouterTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render 404 heading in template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('404 - Page Not Found');
  });

  it('does not expose legacy /hlogin route in application routes', () => {
    const hloginRoute = routes.find(r => r.path === 'hlogin');
    expect(hloginRoute).toBeUndefined();
  });

  it('maps wildcard ** route to NotFoundComponent', () => {
    const wildcardRoute = routes.find(r => r.path === '**');
    expect(wildcardRoute).toBeDefined();
    expect(wildcardRoute?.component).toBe(NotFoundComponent);
  });

  it('maps 404 route to NotFoundComponent', () => {
    const notFoundRoute = routes.find(r => r.path === '404');
    expect(notFoundRoute).toBeDefined();
    expect(notFoundRoute?.component).toBe(NotFoundComponent);
  });
});
