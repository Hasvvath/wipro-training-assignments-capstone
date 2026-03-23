import { Component, Output, EventEmitter } from '@angular/core';
import { Highlight } from '../directives/highlight';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [Highlight],
  templateUrl: './menu.html'
})
export class MenuComponent {
  @Output() menuClick = new EventEmitter<string>();

  select(value: string) {
    this.menuClick.emit(value);
  }
}
