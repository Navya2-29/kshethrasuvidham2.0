import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterModule } from '@angular/router';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LoginComponent } from './core/auth/login/login.component';
import { MasterService } from './services/master/master.service';
import { Title } from '@angular/platform-browser';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatSlideToggleModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Counter';
  logo:string;
  templeName:string;
  constructor(private service:MasterService,private titleService: Title,){
    this.getTempleData();
  }
  getTempleData(){
    this.service.settingsData().subscribe((data)=>{
      console.log(data);
      this.templeName=data[0].Name;
      this.titleService.setTitle( this.templeName);
      // this.logo=data[0].logo;
      // localStorage.setItem('TempleName',this.templeName);
      // localStorage.setItem('Address',data[0].Address);
      
    })
  }
  

}
