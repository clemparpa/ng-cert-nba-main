import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  TemplateRef,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  standalone: true,
  imports: [NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  protected opened: boolean = false;
  private changeDetector = inject(ChangeDetectorRef);

  public open() {
    this.opened = true;
    this.changeDetector.markForCheck();
  }

  public close() {
    this.opened = false;
    this.changeDetector.markForCheck();
  }
}
