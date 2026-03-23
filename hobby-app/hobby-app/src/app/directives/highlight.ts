import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class Highlight {
  @Input() appHighlight: string = '';

  constructor(private readonly el: ElementRef) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    this.highlight(this.appHighlight || 'yellow');
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.highlight('');
  }

  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
