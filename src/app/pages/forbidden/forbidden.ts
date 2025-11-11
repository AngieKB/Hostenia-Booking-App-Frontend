import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { EmptyHeader } from '../../components/empty-header/empty-header';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [EmptyHeader],
  templateUrl: './forbidden.html',
  styleUrl: './forbidden.css'
})
export class Forbidden {
  constructor(private router: Router) {}

  goHome(): void {
    this.router.navigate(['/principal']);
  }
}
