import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { Proyectos } from './proyectos';

describe('Proyectos', () => {
  let component: Proyectos;
  let fixture: ComponentFixture<Proyectos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Proyectos],
      providers: [provideZonelessChangeDetection(), provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Proyectos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the five project cards', () => {
    const cards = fixture.nativeElement.querySelectorAll('.project-card');
    expect(cards.length).toBe(5);
  });

  it('should expose a heading for each project', () => {
    const titles = Array.from(
      fixture.nativeElement.querySelectorAll('.project-title') as NodeListOf<HTMLElement>
    ).map((title) => title.textContent?.trim());

    expect(titles).toEqual(['Telescopio', 'Radiotelescopio', 'Hardware', 'Cúpula', 'Web']);
  });
});
