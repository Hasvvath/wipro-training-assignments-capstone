import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [FormsModule, CommonModule], 
  templateUrl: './course-detail.html',
})
export class CourseDetail {
  @Input() course: any;
}