import { Component, input, output, signal } from '@angular/core';
import { DiseaseData, ModeOfInheritance, MoiBadgesComponent } from '@workspace/ui';
import { MoiSelector } from '../moiselector/moiselector.component';

@Component({
  selector: 'app-moi-summary-dialog',
  templateUrl: './moi-summary-dialog.component.html',
  styleUrls: ['./moi-summary-dialog.component.scss'],
  standalone: true,
  imports: [MoiSelector, MoiBadgesComponent],
})
export class MoiSummaryDialogComponent {
  diseases = input.required<DiseaseData[]>();
  updateMoi = output<{ diseaseIndex: number; moi: ModeOfInheritance }>();

  showMoiIndex = signal<number | null>(null);

  toggleMoi(index: number): void {
    this.showMoiIndex.update((current) => (current === index ? null : index));
  }
}