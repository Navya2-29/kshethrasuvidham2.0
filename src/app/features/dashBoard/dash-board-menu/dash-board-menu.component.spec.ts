import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashBoardMenuComponent } from './dash-board-menu.component';

describe('DashBoardMenuComponent', () => {
  let component: DashBoardMenuComponent;
  let fixture: ComponentFixture<DashBoardMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashBoardMenuComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashBoardMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
