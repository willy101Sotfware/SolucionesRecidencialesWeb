import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { BuildingFormComponent } from './features/buildings/components/building-form/building-form.component';
import { BuildingListComponent } from './features/buildings/components/building-list/building-list.component';
import { CompanyFormComponent } from './features/companies/components/company-form/company-form.component';
import { CompanyListComponent } from './features/companies/components/company-list/company-list.component';
import { EmployeeFormComponent } from './features/employees/components/employee-form/employee-form.component';
import { EmployeeListComponent } from './features/employees/components/employee-list/employee-list.component';
import { LoginComponent } from './features/login/login.component';
import { QuotationFormComponent } from './features/quotations/components/quotation-form/quotation-form.component';
import { QuotationListComponent } from './features/quotations/components/quotation-list/quotation-list.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'companies', pathMatch: 'full' },
            {
                path: 'companies',
                children: [
                    { path: '', component: CompanyListComponent },
                    { path: 'new', component: CompanyFormComponent },
                    { path: 'edit/:id', component: CompanyFormComponent }
                ]
            },
            {
                path: 'buildings',
                children: [
                    { path: '', component: BuildingListComponent },
                    { path: 'new', component: BuildingFormComponent },
                    { path: 'edit/:id', component: BuildingFormComponent }
                ]
            },
            {
                path: 'employees',
                children: [
                    { path: '', component: EmployeeListComponent },
                    { path: 'new', component: EmployeeFormComponent },
                    { path: 'edit/:id', component: EmployeeFormComponent }
                ]
            },
            {
                path: 'quotations',
                children: [
                    { path: '', component: QuotationListComponent },
                    { path: 'new', component: QuotationFormComponent },
                    { path: 'edit/:id', component: QuotationFormComponent }
                ]
            }
        ]
    },
    { path: '**', redirectTo: 'login' }
];
