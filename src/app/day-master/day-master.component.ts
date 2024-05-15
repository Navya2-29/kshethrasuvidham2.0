import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SpinnerComponent } from '../shared/component/spinner/spinner.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ThemePalette } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
export interface Task {
  name: string;
  completed: boolean;
  color: ThemePalette;
  subtasks?: Task[];
}
@Component({
  selector: 'app-day-master',
  standalone: true,
  imports: [HeaderComponent,SpinnerComponent, MatIconModule,MatInputModule,MatCheckboxModule,FormsModule],
  templateUrl: './day-master.component.html',
  styleUrl: './day-master.component.css'
})
export class DayMasterComponent {
  task: Task = {
    name: 'select all',
    completed: false,
    color: 'primary',
    subtasks: [
      {name: 'sunday', completed: false, color: 'primary'},
      {name: 'monday', completed: false, color: 'primary'},
      {name: 'tuesday', completed: false, color: 'primary'},
      {name: 'wednesday', completed: false, color: 'primary'},
      {name: 'thursady', completed: false, color: 'primary'},

      {name: 'friday', completed: false, color: 'primary'},
      {name: 'satursday', completed: false, color: 'primary'},

    ],
  };

  allComplete: boolean = false;

  updateAllComplete() {
    this.allComplete = this.task.subtasks != null && this.task.subtasks.every(t => t.completed);
  }

  someComplete(): boolean {
    if (this.task.subtasks == null) {
      return false;
    }
    return this.task.subtasks.filter(t => t.completed).length > 0 && !this.allComplete;
  }

  setAll(completed: boolean) {
    this.allComplete = completed;
    if (this.task.subtasks == null) {
      return;
    }
    this.task.subtasks.forEach(t => (t.completed = completed));
  }
}
