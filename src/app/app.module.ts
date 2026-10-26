import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import {
  BrowserAnimationsModule,
  NoopAnimationsModule,
} from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { PatientComponent } from './patient/patient.component';
import { PauthComponent } from './patient/pauth/pauth.component';
import { PloginComponent } from './patient/pauth/plogin/plogin.component';
import { PsignupComponent } from './patient/pauth/psignup/psignup.component';
import { DoctorComponent } from './doctor/doctor.component';
import { DauthComponent } from './doctor/dauth/dauth.component';
import { DloginComponent } from './doctor/dauth/dlogin/dlogin.component';
import { DsignupComponent } from './doctor/dauth/dsignup/dsignup.component';
//import { PappointmentsComponent } from './patient/pappointments/pappointments.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { CarouselModule } from 'ngx-owl-carousel-o';

import { ToastrModule } from 'ngx-toastr';
import { NgChartsModule } from 'ng2-charts';
import { Chart, registerables } from 'chart.js';
// chart.js v4 requires explicit registration of chart types/elements
// (v2's global auto-registration is gone).
Chart.register(...registerables);

import { PatientAuthGuard } from './patient/pauth/patient-auth.guard';
import { ListPappointmentComponent } from './patient/pappointments/list-pappointment/list-pappointment.component';
import { CreatePappointmentComponent } from './patient/pappointments/create-pappointment/create-pappointment.component';
import { HomeComponent } from './home/home.component';
import { DappointmentComponent } from './doctor/dappointment/dappointment.component';
import { DoctorAuthGuard } from './doctor/dauth/doctor-auth.guard';
import { AuthComponent } from './auth/auth.component';
import { AuthInterceptor } from './auth/auth-interceptor';
import { AuthGuard } from './auth/auth.guard';
import { CreateDappointmentComponent } from './doctor/dappointment/create-dappointment/create-dappointment.component';
import { ListDappointmentComponent } from './doctor/dappointment/list-dappointment/list-dappointment.component';
import { AppointmentComponent } from './appointment/appointment.component';
import { PprofileComponent } from './patient/pprofile/pprofile.component';
import { PmedreportComponent } from './patient/pmedreport/pmedreport.component';
import { ListPmedreportComponent } from './patient/pmedreport/list-pmedreport/list-pmedreport.component';
import { CreatePmedreportComponent } from './patient/pmedreport/create-pmedreport/create-pmedreport.component';
import { ListPatientsCalendarComponent } from './doctor/dappointment/list-patients-calendar/list-patients-calendar.component';
import { ListPatientsMedreportComponent } from './doctor/dappointment/list-patients-medreport/list-patients-medreport.component';
import { FooterComponent } from './footer/footer.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CreatePatientPrescriptionComponent } from './doctor/dappointment/create-patient-prescription/create-patient-prescription.component';
import { ListPrescriptionsComponent } from './patient/pappointments/list-prescriptions/list-prescriptions.component';
import { HowitworksComponent } from './howitworks/howitworks.component';
import { AboutusComponent } from './aboutus/aboutus.component';
import { PaccountverifyComponent } from './patient/paccountverify/paccountverify.component';
import { PconsentComponent } from './patient/pconsent/pconsent.component';
import { HelperComponent } from './helper/helper.component';
import { NewHelperLoginComponent } from './new-helper/login/new-helper-login.component';
import { DashboardComponent } from './new-helper/dashboard/dashboard.component';
import { NewHelperRegisterComponent } from './new-helper/register/new-helper-regiester.component';
import { HauthComponent } from './helper/hauth/hauth.component';
import { HloginComponent } from './helper/hauth/hlogin/hlogin.component';
import { HsignupComponent } from './helper/hauth/hsignup/hsignup.component';
import { AdminComponent } from './admin/admin.component';
import { AdminAuthComponent } from './admin/admin-auth/admin-auth.component';
import { AdminDoctorComponent } from './admin/admin-doctor/admin-doctor.component';
import { AdminPatientComponent } from './admin/admin-patient/admin-patient.component';
import { AdminMISComponent } from './admin/admin-mis/admin-mis.component';
import { AdminHelperComponent } from './admin/admin-helper/admin-helper.component';
import { ContentManagementComponent } from './admin/content-management/content-management.component';
import { ContentListComponent } from './admin/content-management/content-list/content-list.component';
import { ContentDetailsComponent } from './admin/content-management/content-details/content-details.component';
import { PreceiptComponent } from './patient/preceipt/preceipt.component';
import { DprofileComponent } from './doctor/dprofile/dprofile.component';
import { StaticPagesComponent } from './static-pages/static-pages.component';
import { ContactusComponent } from './static-pages/contactus/contactus.component';
import { TermsnconditionComponent } from './static-pages/termsncondition/termsncondition.component';
import { ErrorInterceptor } from './error-interceptor';
import { ErrorComponent } from './error/error.component';
import { PchangpwdComponent } from './patient/pchangpwd/pchangpwd.component';
import { PatientlistComponent } from './patient/patientlist/patientlist.component';
import { DchangpwdComponent } from './doctor/dchangpwd/dchangpwd.component';
import { DoctorsprofileComponent } from './admin/content-management/doctorsprofile/doctorsprofile.component';
import { RefundAndCancellationComponent } from './static-pages/refund-and-cancellation/refund-and-cancellation.component';
import { PriceAndPaymentComponent } from './static-pages/price-and-payment/price-and-payment.component';
import { PrivacyPolicyComponent } from './static-pages/privacy-policy/privacy-policy.component';
import { WelcomeBoxComponent } from './welcome-box/welcome-box.component';
import { ForgotpwdComponent } from './patient/forgotpwd/forgotpwd.component';
import { DforgotpwdComponent } from './doctor/dforgotpwd/dforgotpwd.component';
import { PwdresetComponent } from './patient/forgotpwd/pwdreset/pwdreset.component';
import { DpwdresetComponent } from './doctor/dforgotpwd/dpwdreset/dpwdreset.component';
import { PublicPagesComponent } from './public-pages/public-pages.component';
import { HomePageComponent } from './public-pages/home-page/home-page.component';
import { ReusableComponentsComponent } from './reusable-components/reusable-components.component';
import { ColourfulHeaderComponent } from './reusable-components/colourful-header/colourful-header.component';
import { BlankHeaderComponent } from './reusable-components/blank-header/blank-header.component';
import { FooterPublicComponent } from './reusable-components/footer-public/footer-public.component';
import { AboutSecondOpinionComponent } from './public-pages/about-second-opinion/about-second-opinion.component';
import { AboutPageComponent } from './public-pages/about-page/about-page.component';
import { CancellationRefundPolicyComponent } from './public-pages/cancellation-refund-policy/cancellation-refund-policy.component';
import { CareersComponent } from './public-pages/careers/careers.component';
import { CodeEthicsComponent } from './public-pages/code-ethics/code-ethics.component';
import { ContactPageComponent } from './public-pages/contact-page/contact-page.component';
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
import { PatientNavbarComponent } from './reusable-components/patient-navbar/patient-navbar.component';
import { InternalHeaderComponent } from './reusable-components/internal-header/internal-header.component';
import { InternalFooterComponent } from './reusable-components/internal-footer/internal-footer.component';
import { DoctorNavbarComponent } from './reusable-components/doctor-navbar/doctor-navbar.component';
import { AdminNavbarComponent } from './reusable-components/admin-navbar/admin-navbar.component';
import { AdminListPatientsComponent } from './admin/admin-list-patients/admin-list-patients.component';
import { AdminListDoctorsComponent } from './admin/admin-list-doctors/admin-list-doctors.component';
import { AdminDoctorsPaymentsComponent } from './admin/admin-doctors-payments/admin-doctors-payments.component';
import { DocTypesComponent } from './admin/doc-types/doc-types.component';
import { DocPaymentsComponent } from './doctor/doc-payments/doc-payments.component';
import { DoctorExtrasComponent } from './admin/doctor-extras/doctor-extras.component';
import { UpcomingAppointmentComponent } from './doctor/dappointment/upcoming-appointment/upcoming-appointment.component';
import { PastAppointmentComponent } from './doctor/dappointment/past-appointment/past-appointment.component';
import { DialogDocValidationComponent } from './admin/admin-doctor/dialog-doc-validation/dialog-doc-validation.component';
import { AuthDialogBoxComponent } from './auth/auth-dialog-box/auth-dialog-box.component';

@NgModule({ declarations: [
        AppComponent,
        HeaderComponent,
        PatientComponent,
        PauthComponent,
        PloginComponent,
        PsignupComponent,
        DoctorComponent,
        DauthComponent,
        DloginComponent,
        DsignupComponent,
        NewHelperLoginComponent,
        ListPappointmentComponent,
        CreatePappointmentComponent,
        HomeComponent,
        DappointmentComponent,
        AuthComponent,
        CreateDappointmentComponent,
        ListDappointmentComponent,
        AppointmentComponent,
        PprofileComponent,
        PmedreportComponent,
        ListPmedreportComponent,
        CreatePmedreportComponent,
        ListPatientsCalendarComponent,
        ListPatientsMedreportComponent,
        FooterComponent,
        CreatePatientPrescriptionComponent,
        ListPrescriptionsComponent,
        HowitworksComponent,
        AboutusComponent,
        PaccountverifyComponent,
        PconsentComponent,
        HelperComponent,
        HauthComponent,
        HloginComponent,
        HsignupComponent,
        AdminComponent,
        DashboardComponent,
        AdminAuthComponent,
        AdminDoctorComponent,
        AdminPatientComponent,
        AdminMISComponent,
        AdminHelperComponent,
        ContentManagementComponent,
        ContentListComponent,
        ContentDetailsComponent,
        PreceiptComponent,
        DprofileComponent,
        StaticPagesComponent,
        ContactusComponent,
        NewHelperRegisterComponent,
        TermsnconditionComponent,
        ErrorComponent,
        PchangpwdComponent,
        DchangpwdComponent,
        DoctorsprofileComponent,
        RefundAndCancellationComponent,
        PriceAndPaymentComponent,
        PrivacyPolicyComponent,
        WelcomeBoxComponent,
        ForgotpwdComponent,
        DforgotpwdComponent,
        PwdresetComponent,
        DpwdresetComponent,
        PublicPagesComponent,
        HomePageComponent,
        ReusableComponentsComponent,
        ColourfulHeaderComponent,
        BlankHeaderComponent,
        FooterPublicComponent,
        AboutSecondOpinionComponent,
        AboutPageComponent,
        CancellationRefundPolicyComponent,
        CareersComponent,
        CodeEthicsComponent,
        ContactPageComponent,
        HowItWorksComponent,
        KnowledgeCenterComponent,
        LandingComponent,
        OneStopSolutionComponent,
        PartnersComponent,
        PressMediaComponent,
        PricingComponent,
        PrivacyStatementComponent,
        SpecialistsComponent,
        SupportPageComponent,
        TermsOfUseComponent,
        TestInvestigationProceduresComponent,
        TestimonialComponent,
        VideoConsultancyComponent,
        WhenToLookForSecondOpinionComponent,
        PatientNavbarComponent,
        InternalHeaderComponent,
        InternalFooterComponent,
        DoctorNavbarComponent,
        AdminNavbarComponent,
        AdminListPatientsComponent,
        AdminListDoctorsComponent,
        AdminDoctorsPaymentsComponent,
        DocTypesComponent,
        DocPaymentsComponent,
        DoctorExtrasComponent,
        UpcomingAppointmentComponent,
        PastAppointmentComponent,
        DialogDocValidationComponent,
        AuthDialogBoxComponent,
        PatientlistComponent,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        NoopAnimationsModule,
        MatToolbarModule,
        MatButtonModule,
        MatFormFieldModule,
        MatTableModule,
        MatCardModule,
        ReactiveFormsModule,
        FormsModule,
        MatProgressSpinnerModule,
        MatInputModule,
        MatExpansionModule,
        MatPaginatorModule,
        MatDialogModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatMenuModule,
        MatCheckboxModule,
        MatIconModule,
        MatSlideToggleModule,
        CarouselModule,
        BrowserAnimationsModule,
        NgChartsModule,
        ToastrModule.forRoot({
            timeOut: 5000,
        }),
        NgbModule], providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        // { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
        //{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
        PatientAuthGuard,
        DoctorAuthGuard,
        AuthGuard,
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
    ] })
export class AppModule {}
