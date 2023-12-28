import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-city-crud',
  templateUrl: './city-crud.component.html',
  styleUrl: './city-crud.component.css'
})
export class CityCrudComponent {
  cities: any[] = [];
  selectedCity: any = {};
  newCity: any = {};
  constructor(private http: HttpClient) { }
  ngOnInit(): void {
    this.http.get<any[]>('http://localhost:8222/api/blogs/city').subscribe(data => {
      this.cities = data;
    });
  }
  editCity(city: any): void {
    this.http.get<any>('http://localhost:8222/api/blogs/city/' + city).subscribe(data => {
      this.selectedCity = data;
    });
  }
  removeCity(city: any) {
    this.http.request('DELETE', 'http://localhost:8222/api/blogs/city/'+city.id).subscribe(response => {
      window.location.reload();
    }, error => {
      Swal.fire('Error', 'Something went wrong', 'error');
    });
  }
  updateCity() {
    const cityData = {
      ...this.selectedCity
    };

    this.http.post('http://localhost:8222/api/blogs/city', cityData).subscribe(response => {
      window.location.reload();
    }, error => {
      Swal.fire('Error', 'An error occurred while updating device', 'error');
    });
  }
  deleteCity() {
    this.http.request('DELETE', 'http://localhost:8222/api/blogs/city/'+this.selectedCity.id ).subscribe(response => {
      window.location.reload();
    }, error => {
      Swal.fire('Error', 'You cant delete this City', 'error');
    });
  }

  addCity() {
    const cityData = {
      ...this.newCity,
    };
    this.http.post('http://localhost:8222/api/blogs/city', cityData).subscribe(response => {
      window.location.reload();
    }, error => {
      Swal.fire('Error', 'An error occurred while adding category', 'error');
    });
  }
}
