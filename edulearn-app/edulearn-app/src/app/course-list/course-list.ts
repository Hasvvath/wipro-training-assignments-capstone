import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseDetail } from '../course-detail/course-detail';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, CourseDetail],
  templateUrl: './course-list.html',
})
export class CourseList {

  courses = [
    { id: 1, title: 'Angular Basics', description: 'Learn Angular fundamentals' },
    { id: 2, title: 'React Basics', description: 'Learn React fundamentals' },
    { id: 3, title: 'Node.js', description: 'Backend development with Node' }
  ];

  selectedCourse: any = null;

  selectCourse(course: any) {
    this.selectedCourse = course;
  }
}