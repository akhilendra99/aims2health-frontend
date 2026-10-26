import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { DappointmentService } from '../dappointment.service';
import { ListPatientsMedreportComponent } from './list-patients-medreport.component';

describe('ListPatientsMedreportComponent PDF resource URLs', () => {
  let component: ListPatientsMedreportComponent;
  let sanitizer: jasmine.SpyObj<DomSanitizer>;

  beforeEach(() => {
    sanitizer = jasmine.createSpyObj<DomSanitizer>('DomSanitizer', ['bypassSecurityTrustResourceUrl']);
    sanitizer.bypassSecurityTrustResourceUrl.and.returnValue('trusted-pdf' as any);
    component = new ListPatientsMedreportComponent(
      sanitizer,
      {} as DappointmentService,
      {} as ActivatedRoute,
      {} as AuthService
    );
  });

  it('allows a PDF under the configured backend images path', () => {
    const result = component.transform('/images/medical-report.pdf');

    expect(result).toBe('trusted-pdf' as any);
    expect(sanitizer.bypassSecurityTrustResourceUrl).toHaveBeenCalled();
  });

  it('rejects external, script, and non-PDF resource URLs without trusting them', () => {
    expect(component.transform('https://attacker.invalid/evil.pdf')).toBeNull();
    expect(component.transform('javascript:alert(1)')).toBeNull();
    expect(component.transform('/images/report.svg')).toBeNull();
    expect(sanitizer.bypassSecurityTrustResourceUrl).not.toHaveBeenCalled();
  });
});
