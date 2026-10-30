import { Component, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { AdminNavbarComponent } from './admin-navbar/admin-navbar.component';
import { DoctorNavbarComponent } from './doctor-navbar/doctor-navbar.component';
import { PatientNavbarComponent } from './patient-navbar/patient-navbar.component';

@Component({ template: '', standalone: false })
class SidebarNavigationTargetComponent {}

interface SidebarNavigationCase {
  name: string;
  component: Type<unknown>;
  linkText: string;
  route: string;
  removedHandlers: string[];
}

const navigationCases: SidebarNavigationCase[] = [
  {
    name: 'doctor',
    component: DoctorNavbarComponent,
    linkText: 'All Appointments',
    route: '/ddashboard',
    removedHandlers: [
      'gotoPDashboard', 'gotoPastDashboard', 'gotoUpcomingDashboard',
      'gotoSchedule', 'gotoChangePwd', 'gotoPayments',
    ],
  },
  {
    name: 'admin',
    component: AdminNavbarComponent,
    linkText: 'All Patients',
    route: '/alistpatients',
    removedHandlers: [
      'gotoSchedule', 'gotoListPatients', 'gotoListDoctors', 'gotoMIS',
      'gotoDocTypes', 'gotoDocExtras', 'gotoPDashboard', 'gotoChangePwd',
    ],
  },
  {
    name: 'patient',
    component: PatientNavbarComponent,
    linkText: 'My Appointments',
    route: '/pdashboard',
    removedHandlers: [
      'gotoSchedule', 'gotoPDashboard', 'gotoPatientList', 'gotoMedRecords',
      'gotoPconsent', 'gotoChangePwd',
    ],
  },
];

describe('sidebar navigation stays within Angular routing', () => {
  for (const navigationCase of navigationCases) {
    describe(navigationCase.name, () => {
      let fixture: any;

      beforeEach(async () => {
        const authStatus = new Subject<boolean>();
        const authService = {
          getIsAuth: () => true,
          getAuthStatusListner: () => authStatus.asObservable(),
          getUserName: () => 'Test User',
          getUserRole: () => navigationCase.name === 'doctor' ? 'd'
            : navigationCase.name === 'admin' ? 'a' : 'p',
          getUserId: () => 1,
          getUserEmail: () => 'user@example.com',
          logout: jasmine.createSpy('logout'),
        };

        await TestBed.configureTestingModule({
          imports: [RouterTestingModule.withRoutes([
            { path: '**', component: SidebarNavigationTargetComponent },
          ])],
          declarations: [navigationCase.component, SidebarNavigationTargetComponent],
          providers: [
            { provide: AuthService, useValue: authService },
          ],
        }).compileComponents();

        fixture = TestBed.createComponent(navigationCase.component);
        fixture.detectChanges();
      });

      afterEach(() => {
        fixture?.destroy();
        TestBed.resetTestingModule();
      });

      it('uses the expected routerLink and does not expose a full-page navigation handler', async () => {
        const component = fixture.componentInstance as Record<string, unknown>;
        for (const handlerName of navigationCase.removedHandlers) {
          expect(component[handlerName]).withContext(handlerName).toBeUndefined();
        }

        const links = Array.from(
          fixture.nativeElement.querySelectorAll('a[routerLink]') as NodeListOf<HTMLAnchorElement>
        );
        const link = links.find((candidate) => candidate.textContent?.trim() === navigationCase.linkText);
        expect(link).toBeDefined();
        expect(link?.getAttribute('routerLink')).toBe(navigationCase.route);

        link?.click();
        await fixture.whenStable();

        expect(TestBed.inject(Router).url).toBe(navigationCase.route);
      });
    });
  }
});
