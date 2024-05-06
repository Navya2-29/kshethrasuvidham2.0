import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MobserachbtnComponent } from './mobserachbtn.component';

describe('MobserachbtnComponent', () => {
  let component: MobserachbtnComponent;
  let fixture: ComponentFixture<MobserachbtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MobserachbtnComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MobserachbtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
