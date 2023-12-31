import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CityCrudComponent } from './city-crud.component';

describe('CityCrudComponent', () => {
  let component: CityCrudComponent;
  let fixture: ComponentFixture<CityCrudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CityCrudComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CityCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
