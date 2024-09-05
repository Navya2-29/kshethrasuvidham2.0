import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanjangamComponent } from './panjangam.component';

describe('PanjangamComponent', () => {
  let component: PanjangamComponent;
  let fixture: ComponentFixture<PanjangamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanjangamComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PanjangamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
