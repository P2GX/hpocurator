import {
  Component,
  computed,
  HostListener,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EtlCellValue, EtlCellStatus } from '@workspace/ui';
import { EtlCellEditDialogComponent, CellEditData } from './etl-cell-edit-dialog.component';

interface ContextMenuRequest {
  event: MouseEvent;
  cell: EtlCellValue;
  rowIndex: number;
  colIndex: number;
}

interface CellEditPayload {
  rowIndex: number;
  colIndex: number;
  newValue: string;
}

@Component({
  selector: 'etl-cell',
  templateUrl: './etlcell.component.html',
  styleUrls: ['./etlcell.component.css'],
  imports: [CommonModule, EtlCellEditDialogComponent],
})
export class EtlCellComponent {
  cell = input.required<EtlCellValue>();
  rowIndex = input.required<number>();
  colIndex = input.required<number>();
  edited = output<CellEditPayload>();
  contextMenuRequested = output<ContextMenuRequest>();

  current = computed(() => this.cell().current ?? '');
  status = computed(() => this.cell().status);
  error = computed(() => this.cell().error ?? undefined);
  original = computed(() => this.cell().original);

  editDialogData = signal<CellEditData | null>(null);

  readonly cellClass = computed(() => {
    switch (this.status()) {
      case EtlCellStatus.Raw: return 'cell-raw';
      case EtlCellStatus.Transformed: return 'cell-transformed';
      case EtlCellStatus.Error: return 'cell-error';
      case EtlCellStatus.Ignored: return 'cell-ignored';
      default: return '';
    }
  });

   readonly tooltipText = computed(() => {
    const orig = this.original();
    const curr = this.current();
    const err = this.error();
    if (err) return `error: ${err}`;
    if (curr.length === 0) return `${orig} (raw)`;
    return `original: ${orig}\ntransformed: ${curr}`;
  });

  @HostListener('contextmenu', ['$event'])
  onRightClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.contextMenuRequested.emit({
      event,
      cell: this.cell(),
      rowIndex: this.rowIndex(),
      colIndex: this.colIndex(),
    });
  }

  /** Apply a transformed value */
  setTransformed(newValue: string) {
    this.edited.emit({rowIndex: this.rowIndex(), colIndex: this.colIndex(), newValue })
  }

  /** Apply an error value 
  setError(errorMessage: string) {
    this.status.set(EtlCellStatus.Error);
    this.error.set(errorMessage);
    this.emitChange();
  }*/

  /** Reset to raw */
  resetRaw() {
    this.edited.emit({ rowIndex: this.rowIndex(), colIndex: this.colIndex(), newValue: '' });
  }

   /** Open the manual edit dialog for this cell. */
  editManually(): void {
    this.editDialogData.set({ original: this.original(), current: this.current() });
  }



  onDialogSaved(newValue: string) {
    this.editDialogData.set(null);
    this.setTransformed(newValue);
  }

  onDialogCancelled() {
    this.editDialogData.set(null);
  }

}