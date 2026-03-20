import { Component } from '@angular/core';
import { CourseList } from './course-list/course-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CourseList],
  templateUrl: './app.html',
})
export class App {
}