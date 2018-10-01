import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class QuizService {

  constructor(private http: HttpClient) { }

  get(url: string) {
    return this.http.get(url);
  }

  getAll() {
    return [
      { id: 'data/bdi2.json', name: 'BDI-2 TEST' },
      { id: 'data/bai.json', name: 'BAI TEST' }
      // { id: 'data/designPatterns.json', name: 'Design Patterns' }
    ];
  }

}
