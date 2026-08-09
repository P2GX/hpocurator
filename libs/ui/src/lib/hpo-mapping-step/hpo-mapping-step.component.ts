import { Component, input, output, effect, viewChild, ElementRef, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TableCellEditorComponent } from "../table-cell-editor/table-cell-editor.component";
import { CellValue, HpoMappingResult } from "../models/hpo_term_dto";


type QuickState = 'Observed' | 'Excluded' | 'Na';

/**
 * This component is called from TableEditorComponent when the user is processing a column that
 * represents a single HPO term. First, the user chooses the corresponding HPO term with the
 * HpoPopupDialogComponent. The method onHpoTermSelected in TableEditorComponent then collects
 * the unique values in the column (e.g., +,-,yes,no,...) and passes these values to the component
 * as the input uniqueValues. In this component, the user maps these values to CellValue objects
 * (Observed/Excluded/Na, or OnsetAge with a specific onset, plus optional modifiers) and returns
 * the map to TableEditorComponent where the actual column mapping is then performed.
 */
@Component({
  selector: 'app-hpo-mapping-step',
  standalone: true,
  imports: [CommonModule, FormsModule, TableCellEditorComponent],
  templateUrl: './hpo-mapping-step.component.html',
  styleUrl: './hpo-mapping-step.component.scss'
})
export class HpoMappingStepComponent {
  header = input.required<string>();
  hpoLabel = input.required<string>();
  hpoId = input.required<string>();
  uniqueValues = input.required<string[]>();

  OBSERVED_HINTS = new Set([
    '+', 'yes', 'y', 'true', '1', 'present', 'pos', 'positive', 'obs', 'observed'
  ]);

  EXCLUDED_HINTS = new Set([
    '-', 'no', 'n', 'false', '0', 'absent', 'neg', 'negative', 'exc', 'excluded'
  ]);

  /* We first try to infer the meaning of the unique values in the table,
      e.g., yes, no, +, -, and map to Observed/Excluded/Na
  */
  inferStateFromRawValue(raw: string): QuickState {
    const normalized = raw.trim().toLowerCase();
    if (this.OBSERVED_HINTS.has(normalized)) {
      return 'Observed';
    } else if (this.EXCLUDED_HINTS.has(normalized)) {
      return 'Excluded';
    } else {
      return 'Na';
    }
  }

  /** Which raw value (if any) currently has its detail editor expanded */
  activeEditValue = signal<string | null>(null);
  valueToCellMap: { [key: string]: CellValue } = {};

  mappingConfirmed = output<HpoMappingResult>();
  cancelled = output<void>();

  private dialogElement = viewChild<ElementRef<HTMLDialogElement>>('nativeMappingDialog');

  constructor() {
    effect(() => {
      const dialog = this.dialogElement()?.nativeElement;
      if (dialog && !dialog.open) {
        dialog.showModal();
      }
    });
    effect(() => {
      const values = this.uniqueValues();
      for (const value of values) {
        if (!(value in this.valueToCellMap)) {
          this.valueToCellMap[value] = { type: this.inferStateFromRawValue(value) };
        }
      }
    });
  }

  /** Quick-pick button handler: sets a simple status, discarding any prior onset/modifiers for this value */
  setQuickState(value: string, state: QuickState): void {
    this.valueToCellMap[value] = { type: state };
  }

  toggleEditor(value: string): void {
    this.activeEditValue.update(current => (current === value ? null : value));
  }

  isEditingActive(value: string): boolean {
    return this.activeEditValue() === value;
  }

  /** Bound to TableCellEditorComponent's (dataChanged) for the row currently being edited */
  onCellDetailChanged(value: string, updated: CellValue): void {
    this.valueToCellMap[value] = updated;
  }

  currentCellValue(value: string): CellValue {
    return this.valueToCellMap[value] ?? { type: 'Na' };
  }

  confirm(): void {
    const dialog = this.dialogElement()?.nativeElement;
    if (dialog) dialog.close();
    // Fill in default values for any keys the user skipped picking a select option for
    this.uniqueValues().forEach(value => {
      if (!this.valueToCellMap[value]) {
        this.valueToCellMap[value] = { type: 'Na' };
      }
    });

    this.mappingConfirmed.emit({
      hpoLabel: this.hpoLabel(),
      hpoId: this.hpoId(),
      valueToStateMap: this.valueToCellMap, // field name stays valueToStateMap per HpoMappingResult, but now holds CellValue objects
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}