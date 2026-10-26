import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AboutusComponent } from './aboutus/aboutus.component';
import { AdminAuthComponent } from './admin/admin-auth/admin-auth.component';
import { AdminDoctorComponent } from './admin/admin-doctor/admin-doctor.component';
import { AdminDoctorsPaymentsComponent } from './admin/admin-doctors-payments/admin-doctors-payments.component';
import { AdminHelperComponent } from './admin/admin-helper/admin-helper.component';
import { AdminListDoctorsComponent } from './admin/admin-list-doctors/admin-list-doctors.component';
import { AdminListPatientsComponent } from './admin/admin-list-patients/admin-list-patients.component';
import { AdminMISComponent } from './admin/admin-mis/admin-mis.component';
import { AdminPatientComponent } from './admin/admin-patient/admin-patient.component';
import { ContentListComponent } from './admin/content-management/content-list/content-list.component';
import { DoctorsprofileComponent } from './admin/content-management/doctorsprofile/doctorsprofile.component';
import { DocTypesComponent } from './admin/doc-types/doc-types.component';
import { DoctorExtrasComponent } from './admin/doctor-extras/doctor-extras.component';
import { AuthGuard } from './auth/auth.guard';
import { CreateDappointmentComponent } from './doctor/dappointment/create-dappointment/create-dappointment.component';
import { CreatePatientPrescriptionComponent } from './doctor/dappointment/create-patient-prescription/create-patient-prescription.component';
import { DappointmentComponent } from './doctor/dappointment/dappointment.component';
import { ListDappointmentComponent } from './doctor/dappointment/list-dappointment/list-dappointment.component';
import { ListPatientsCalendarComponent } from './doctor/dappointment/list-patients-calendar/list-patients-calendar.component';
import { ListPatientsMedreportComponent } from './doctor/dappointment/list-patients-medreport/list-patients-medreport.component';
import { PastAppointmentComponent } from './doctor/dappointment/past-appointment/past-appointment.component';
import { UpcomingAppointmentComponent } from './doctor/dappointment/upcoming-appointment/upcoming-appointment.component';
import { DloginComponent } from './doctor/dauth/dlogin/dlogin.component';
import { DoctorAuthGuard } from './doctor/dauth/doctor-auth.guard';
import { DoctorAuthService } from './doctor/dauth/doctor-auth.service';
import { DsignupComponent } from './doctor/dauth/dsignup/dsignup.component';
import { PatientlistComponent } from './patient/patientlist/patientlist.component';
import { DchangpwdComponent } from './doctor/dchangpwd/dchangpwd.component';
import { DforgotpwdComponent } from './doctor/dforgotpwd/dforgotpwd.component';
import { DpwdresetComponent } from './doctor/dforgotpwd/dpwdreset/dpwdreset.component';
import { DocPaymentsComponent } from './doctor/doc-payments/doc-payments.component';
import { DoctorComponent } from './doctor/doctor.component';
import { DprofileComponent } from './doctor/dprofile/dprofile.component';
import { HloginComponent } from './helper/hauth/hlogin/hlogin.component';
import { HsignupComponent } from './helper/hauth/hsignup/hsignup.component';
import { NewHelperLoginComponent } from './new-helper/login/new-helper-login.component';
import { DashboardComponent } from './new-helper/dashboard/dashboard.component';
import { NewHelperRegisterComponent } from './new-helper/register/new-helper-regiester.component';
import { HelperComponent } from './helper/helper.component';
import { HomeComponent } from './home/home.component';
import { HowitworksComponent } from './howitworks/howitworks.component';
import { ForgotpwdComponent } from './patient/forgotpwd/forgotpwd.component';
import { PwdresetComponent } from './patient/forgotpwd/pwdreset/pwdreset.component';
import { PaccountverifyComponent } from './patient/paccountverify/paccountverify.component';
import { CreatePappointmentComponent } from './patient/pappointments/create-pappointment/create-pappointment.component';
import { ListPappointmentComponent } from './patient/pappointments/list-pappointment/list-pappointment.component';
import { ListPrescriptionsComponent } from './patient/pappointments/list-prescriptions/list-prescriptions.component';
//import { PappointmentsComponent } from './patient/pappointments/pappointments.component';
import { PatientAuthGuard } from './patient/pauth/patient-auth.guard';

import { PatientAuthService } from './patient/pauth/patient-auth.service';
import { PloginComponent } from './patient/pauth/plogin/plogin.component';
import { PsignupComponent } from './patient/pauth/psignup/psignup.component';
import { PchangpwdComponent } from './patient/pchangpwd/pchangpwd.component';
import { PconsentComponent } from './patient/pconsent/pconsent.component';
import { CreatePmedreportComponent } from './patient/pmedreport/create-pmedreport/create-pmedreport.component';
import { PmedreportComponent } from './patient/pmedreport/pmedreport.component';
import { PprofileComponent } from './patient/pprofile/pprofile.component';
import { PreceiptComponent } from './patient/preceipt/preceipt.component';
import { AboutPageComponent } from './public-pages/about-page/about-page.component';
import { AboutSecondOpinionComponent } from './public-pages/about-second-opinion/about-second-opinion.component';
import { CancellationRefundPolicyComponent } from './public-pages/cancellation-refund-policy/cancellation-refund-policy.component';
import { CareersComponent } from './public-pages/careers/careers.component';
import { CodeEthicsComponent } from './public-pages/code-ethics/code-ethics.component';
import { ContactPageComponent } from './public-pages/contact-page/contact-page.component';
import { HomePageComponent } from './public-pages/home-page/home-page.component';
import { HowItWorksComponent } from './public-pages/how-it-works/how-it-works.component';
import { KnowledgeCenterComponent } from './public-pages/knowledge-center/knowledge-center.component';
import { LandingComponent } from './public-pages/landing/landing.component';
import { OneStopSolutionComponent } from './public-pages/one-stop-solution/one-stop-solution.component';
import { PartnersComponent } from './public-pages/partners/partners.component';
import { PressMediaComponent } from './public-pages/press-media/press-media.component';
import { PricingComponent } from './public-pages/pricing/pricing.component';
import { PrivacyStatementComponent } from './public-pages/privacy-statement/privacy-statement.component';
import { SpecialistsComponent } from './public-pages/specialists/specialists.component';
import { SupportPageComponent } from './public-pages/support-page/support-page.component';
import { TermsOfUseComponent } from './public-pages/terms-of-use/terms-of-use.component';
import { TestInvestigationProceduresComponent } from './public-pages/test-investigation-procedures/test-investigation-procedures.component';
import { TestimonialComponent } from './public-pages/testimonial/testimonial.component';
import { VideoConsultancyComponent } from './public-pages/video-consultancy/video-consultancy.component';
import { WhenToLookForSecondOpinionComponent } from './public-pages/when-to-look-for-second-opinion/when-to-look-for-second-opinion.component';
import { ContactusComponent } from './static-pages/contactus/contactus.component';
import { PriceAndPaymentComponent } from './static-pages/price-and-payment/price-and-payment.component';
import { PrivacyPolicyComponent } from './static-pages/privacy-policy/privacy-policy.component';
import { RefundAndCancellationComponent } from './static-pages/refund-and-cancellation/refund-and-cancellation.component';
import { TermsnconditionComponent } from './static-pages/termsncondition/termsncondition.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: 'howitworks', component: HowitworksComponent },
  { path: 'aboutus', component: AboutusComponent },
  { path: 'contact', component: ContactusComponent },
  { path: 'doctor', component: DoctorComponent },
  { path: 'plogin', component: PloginComponent },
  { path: 'plogin.html', redirectTo: 'plogin', pathMatch: 'full' },
  { path: 'helper', component: HelperComponent },
  { path: 'psignup', component: PsignupComponent },
  { path: 'helper-login', component: NewHelperLoginComponent },
  { path: 'helper-dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { roles: ['h'] } },
  { path: 'helper-register', component: NewHelperRegisterComponent },
  {
    path: 'pdashboard',
    component: ListPappointmentComponent,
    canActivate: [AuthGuard],
    data: { roles: ['p'] },
  },
  {
    path: 'patientlist',
    component: PatientlistComponent,
    canActivate: [AuthGuard],
    data: { roles: ['p'] },
  },

  { path: 'preceipt', component: PreceiptComponent, canActivate: [AuthGuard], data: { roles: ['p'] } },
  {
    path: 'pverify',
    component: PaccountverifyComponent,
    canActivate: [AuthGuard],
    data: { roles: ['p'] },
  },
  { path: 'ppwd', component: PchangpwdComponent, canActivate: [AuthGuard], data: { roles: ['p'] } },
  { path: 'pconsent', component: PconsentComponent, canActivate: [AuthGuard], data: { roles: ['p'] } },
  { path: 'pprofile', component: PprofileComponent, canActivate: [AuthGuard], data: { roles: ['p'] } },
  {
    path: 'precordedit/:postId',
    component: CreatePmedreportComponent,
    canActivate: [AuthGuard],
    data: { roles: ['p'] },
  },
  {
    path: 'pmedreport',
    component: PmedreportComponent,
    canActivate: [AuthGuard],
    data: { roles: ['p'] },
  },
  {
    path: 'pcreate',
    component: CreatePappointmentComponent,
    canActivate: [AuthGuard],
    data: { roles: ['p'] },
  },
  {
    path: 'pprescription/:patientId/:calendarId',
    component: ListPrescriptionsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['p'] },
  },
  { path: 'pforgotpassword', component: ForgotpwdComponent },
  { path: 'presetpwd/:patientId/:token', component: PwdresetComponent },
  { path: 'dlogin', component: DloginComponent },
  { path: 'dsignup', component: DsignupComponent },
  {
    path: 'ddashboard',
    component: ListDappointmentComponent,
    canActivate: [AuthGuard],
    data: { roles: ['d'] },
  },
  {
    path: 'dupcoming',
    component: UpcomingAppointmentComponent,
    canActivate: [AuthGuard],
    data: { roles: ['d'] },
  },
  {
    path: 'dpast',
    component: PastAppointmentComponent,
    canActivate: [AuthGuard],
    data: { roles: ['d'] },
  },
  {
    path: 'dappointment/:postId',
    component: ListPatientsCalendarComponent,
    canActivate: [AuthGuard],
    data: { roles: ['d'] },
  },
  {
    path: 'dpatientmedreport/:patientId/:pFname',
    component: ListPatientsMedreportComponent,
    canActivate: [AuthGuard],
    data: { roles: ['d'] },
  },
  {
    path: 'dpatientprescription/:patientId/:pFname/:pLname/:calendarId',
    component: CreatePatientPrescriptionComponent,
    canActivate: [AuthGuard],
    data: { roles: ['d'] },
  },
  { path: 'dpwd', component: DchangpwdComponent, canActivate: [AuthGuard], data: { roles: ['d'] } },
  {
    path: 'dcreate',
    component: CreateDappointmentComponent,
    canActivate: [AuthGuard],
    data: { roles: ['d'] },
  },
  { path: 'dprofile', component: DprofileComponent, canActivate: [AuthGuard], data: { roles: ['d'] } },
  {
    path: 'dpayments',
    component: DocPaymentsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['d'] },
  },
  { path: 'hlogin', component: HloginComponent },

  { path: 'hsignup', component: HsignupComponent },
  { path: 'mnbvcxzadmin', component: AdminAuthComponent },
  {
    path: 'validatedoc',
    component: AdminDoctorComponent,
    canActivate: [AuthGuard],
    data: { roles: ['a'] },
  },
  {
    path: 'addhelper',
    component: AdminPatientComponent,
    canActivate: [AuthGuard],
    data: { roles: ['a'] },
  },
  {
    path: 'listhelper',
    component: AdminHelperComponent,
    canActivate: [AuthGuard],
    data: { roles: ['a'] },
  },
  {
    path: 'alistpatients',
    component: AdminListPatientsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['a'] },
  },
  {
    path: 'MIS',
    component: AdminMISComponent,
    canActivate: [AuthGuard],
    data: { roles: ['a'] },
  },
  {
    path: 'alistdoctors',
    component: AdminListDoctorsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['a'] },
  },
  { path: 'adoctypes', component: DocTypesComponent, canActivate: [AuthGuard], data: { roles: ['a'] } },
  {
    path: 'adoctorspayment/:postId',
    component: AdminDoctorsPaymentsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['a'] },
  },
  {
    path: 'adocextras',
    component: DoctorExtrasComponent,
    canActivate: [AuthGuard],
    data: { roles: ['a'] },
  },

  { path: 'latestnews', component: ContentListComponent },
  { path: 'indepthnews', component: ContentListComponent },
  { path: 'docprofilelist', component: DoctorsprofileComponent },
  { path: 'tnc', component: TermsnconditionComponent },
  { path: 'refundandcancellation', component: RefundAndCancellationComponent },
  { path: 'priceandpayment', component: PriceAndPaymentComponent },
  { path: 'dforgotpassword', component: DforgotpwdComponent },
  { path: 'dresetpwd/:docId/:token', component: DpwdresetComponent },
  { path: 'privacypolicy', component: PrivacyPolicyComponent },

  { path: 'about', component: AboutPageComponent },
  { path: 'about.html', redirectTo: 'about', pathMatch: 'full' },
  { path: 'pricing', component: PricingComponent },
  { path: 'pricing.html', redirectTo: 'pricing', pathMatch: 'full' },
  { path: 'contact-us', component: ContactPageComponent },
  { path: 'contact-us.html', redirectTo: 'contact-us', pathMatch: 'full' },
  { path: 'video-consultancy', component: VideoConsultancyComponent },
  {
    path: 'video-consultancy.html',
    redirectTo: 'video-consultancy',
    pathMatch: 'full',
  },
  { path: 'careers', component: CareersComponent },
  { path: 'careers.html', redirectTo: 'careers', pathMatch: 'full' },
  { path: 'knowledge-center', component: KnowledgeCenterComponent },
  {
    path: 'knowledge-center.html',
    redirectTo: 'knowledge-center',
    pathMatch: 'full',
  },
  { path: 'about-2nd-opinion', component: AboutSecondOpinionComponent },
  {
    path: 'about-2nd-opinion.html',
    redirectTo: 'about-2nd-opinion',
    pathMatch: 'full',
  },
  { path: 'specialists', component: SpecialistsComponent },
  { path: 'specialists.html', redirectTo: 'specialists', pathMatch: 'full' },
  { path: 'support', component: SupportPageComponent },
  { path: 'support.html', redirectTo: 'support', pathMatch: 'full' },
  { path: 'partners', component: PartnersComponent },
  { path: 'partners.html', redirectTo: 'partners', pathMatch: 'full' },
  {
    path: 'when-to-look-2nd-opinion',
    component: WhenToLookForSecondOpinionComponent,
  },
  {
    path: 'when-to-look-2nd-opinion.html',
    redirectTo: 'when-to-look-2nd-opinion',
    pathMatch: 'full',
  },
  { path: 'landing', component: LandingComponent },
  { path: 'landing.html', redirectTo: 'landing', pathMatch: 'full' },
  { path: 'terms-of-use', component: TermsOfUseComponent },
  { path: 'terms-of-use.html', redirectTo: 'terms-of-use', pathMatch: 'full' },
  { path: 'privacy-statement', component: PrivacyStatementComponent },
  {
    path: 'privacy-statement.html',
    redirectTo: 'privacy-statement',
    pathMatch: 'full',
  },
  { path: 'code-ethics', component: CodeEthicsComponent },
  { path: 'code-ethics.html', redirectTo: 'code-ethics', pathMatch: 'full' },
  { path: 'testimonial', component: TestimonialComponent },
  { path: 'testimonial.html', redirectTo: 'testimonial', pathMatch: 'full' },
  { path: 'press-media', component: PressMediaComponent },
  { path: 'press-media.html', redirectTo: 'press-media', pathMatch: 'full' },
  { path: 'how-it-works', component: HowItWorksComponent },
  { path: 'how-it-works.html', redirectTo: 'how-it-works', pathMatch: 'full' },
  { path: 'one-stop-solution', component: OneStopSolutionComponent },
  {
    path: 'one-stop-solution.html',
    redirectTo: 'one-stop-solution',
    pathMatch: 'full',
  },
  {
    path: 'cancellation-refund-policy',
    component: CancellationRefundPolicyComponent,
  },
  {
    path: 'cancellation-refund-policy.html',
    redirectTo: 'cancellation-refund-policy',
    pathMatch: 'full',
  },
  {
    path: 'test-investigation-procedures',
    component: TestInvestigationProceduresComponent,
  },
  {
    path: 'test-investigation-procedures.html',
    redirectTo: 'test-investigation-procedures',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [PatientAuthService, DoctorAuthService, AuthGuard],
})
export class AppRoutingModule {}
