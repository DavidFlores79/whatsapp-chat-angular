import { Routes, RouterModule } from "@angular/router";
import { ModuleWithProviders } from "@angular/core";
import { ChatComponent } from "./components/chat/chat.component";

const appRoutes: Routes = [
    { path: '', redirectTo: 'chat', pathMatch: 'full'},
    { path: 'chat', component: ChatComponent},
];

export const appRoutingProvider: any[] = [];
export const routing: ModuleWithProviders<any> = RouterModule.forRoot(appRoutes);