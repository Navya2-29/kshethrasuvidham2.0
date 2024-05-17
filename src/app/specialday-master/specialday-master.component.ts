import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../header/header.component';
import { SpinnerComponent } from '../shared/component/spinner/spinner.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MasterService } from '../services/master/master.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Observable, map, startWith } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-specialday-master',
  standalone: true,
  imports: [MatIconModule,MatButtonModule,HeaderComponent,ReactiveFormsModule,SpinnerComponent,MatAutocompleteModule,AsyncPipe],
  templateUrl: './specialday-master.component.html',
  styleUrl: './specialday-master.component.css'
})
export class SpecialdayMasterComponent implements OnInit{
specialDayMasterForm:FormGroup;
vnameList: string[] = [];
staList:string[]=[];
filteredvnmaList: Observable<string[]>;
filteredstarList: Observable<string[]>;

private masterService=inject(MasterService);
private formBuilder=inject(FormBuilder);


constructor(){
this.specialDayMasterForm=this.formBuilder.group({
  vazhipadName :['',[Validators.required]],
	star :['',[Validators.required]],
	SD_MDate :[0],
	SD_EDate :[0],
	SD_Day:[new Date()]
  
})
}
ngOnInit(): void {

  //auto compleate for vazhipad name
  this.filteredvnmaList= this.specialDayMasterForm.get('vazhipadName')!.valueChanges.pipe(
    startWith(''),
    map(value => this._filterSpecialDayVazhipad(value || '')),
  );
  // auto compleate for star
  this.filteredstarList= this.specialDayMasterForm.get('star')!.valueChanges.pipe(
    startWith(''),
    map(value => this._filterStar(value || '')),
  );

  this.getSpecialDayVazipadList();
  this.getStarList();
}


// filter for vazhipad name
private _filterSpecialDayVazhipad(value: string): string[] {
  const filterValue = value.toLowerCase();

  return this.vnameList.filter(option => option.toLowerCase().includes(filterValue));
}

// filter for star
private _filterStar(value: string): string[] {
  const filterstar = value.toLowerCase();

  return this.staList.filter(star => star.toLowerCase().includes(filterstar));
}

// get special day vazipad list
getSpecialDayVazipadList(){
  this.masterService.getAllSpecialVazhipadList().subscribe({
    next:(data)=>{
      console.log(data);
      this.vnameList = data.map(item => item.VM_Name);
      
    },
    error:(err:Error)=>{
      console.log(err)
    }
  })
}
  // get star list
  getStarList(){
    this.masterService.getNakshthra().subscribe({
      next:(data)=>{
        this.staList=data;
        console.log(this.staList)
      }
    })
  }
}





