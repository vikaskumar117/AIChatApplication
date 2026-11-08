import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteFooter } from './shared/site-footer';
import { SiteHeader } from './shared/site-header';

@Component({
  imports: [RouterOutlet, SiteHeader, SiteFooter],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {}
