import { Component, inject, OnInit, input, output, signal, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IconComponent } from "ng-hpo-uikit";
import { HpoTermDuplet } from '../models/hpo_term_dto';

@Component({
  selector: 'app-hpo-modifier-menu',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IconComponent
  ],
  templateUrl: './hpo-modifier-menu.html',
  styleUrls: ['./hpo-modifier-menu.scss'],
})
export class HpoModifierMenuComponent implements OnInit {
  // private modifierService = inject(HpoModifierService);
  private elementRef = inject(ElementRef);

  filterFn = input.required<(query: string) => HpoTermDuplet[]>();
  initFn = input.required<() => Promise<void>>();

  cellData = input.required<any>();
  modifierSelected = output<string>();

  control = new FormControl<string>('');
  placeholder = signal('Search modifiers...');
  options = signal<HpoTermDuplet[]>([]);
  isOpen = signal(false);

  quickModifiers = ['Mild', 'Moderate', 'Severe'];

  async ngOnInit() {
    const init = this.initFn();
    if (init) {
      await init();
    }
    const filter = this.filterFn();
    this.options.set(filter(''));

   // await this.modifierService.ensureModifiersLoaded();
   // this.options.set(this.modifierService.filterLocalTerms(''));

    this.control.valueChanges.subscribe((value) => {
      const query = typeof value === 'string' ? value : '';
      //const filtered = this.modifierService.filterLocalTerms(query);
      this.options.set(filter(query));
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  selectQuickModifier(mod: string) {
    if (mod === 'Mild') {
      mod = 'HP:0012825';
    } else if (mod === 'Moderate') {
      mod = 'HP:0012826';
    } else if (mod === 'Severe') {
      mod = 'HP:0012828';
    }
    this.modifierSelected.emit(mod);
  }

  onFocus() {
    this.isOpen.set(true);
  }

  selectOption(option: HpoTermDuplet) {
    this.modifierSelected.emit(option.hpoId);
    this.control.setValue('');
    this.isOpen.set(false);
  }

  clear() {
    this.control.setValue('');
    this.isOpen.set(true);
  }
}