import {
  AfterViewInit,
  Component,
  ElementRef,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-newhobby',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './newhobby.html'
})
export class NewHobbyComponent implements AfterViewInit {
  newHobby: string = '';
  @ViewChild('newHobbyInput') inputRef?: ElementRef<HTMLInputElement>;

  @Output() addHobby = new EventEmitter<string>();

  ngAfterViewInit() {
    this.inputRef?.nativeElement.focus();
  }

  add() {
    if (this.newHobby.trim()) {
      this.addHobby.emit(this.newHobby);
      this.newHobby = '';
    }
  }
}
