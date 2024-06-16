import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IMetadata, ICreateMetadata } from '../interfaces/metadata.interface';

@Injectable({
  providedIn: 'root',
})
export class MetadataService {
  private apiUrl = 'http://localhost:8080/metadata';

  constructor(private http: HttpClient) {}

  // Obtener todos los metadatos activos
  findAllActive(): Observable<IMetadata[]> {
    return this.http.get<IMetadata[]>(`${this.apiUrl}/active`).pipe(
      catchError(this.handleError)
    );
  }

  // Obtener todos los metadatos inactivos
  findAllInactive(): Observable<IMetadata[]> {
    return this.http.get<IMetadata[]>(`${this.apiUrl}/inactive`).pipe(
      catchError(this.handleError)
    );
  }

  // Agregar nuevos metadatos
  addMetadata(metadata: ICreateMetadata): Observable<ICreateMetadata> {
    return this.http.post<ICreateMetadata>(`${this.apiUrl}/analyze`, metadata).pipe(
      catchError(this.handleError)
    );
  }

  // Actualizar metadatos
  updateMetadata(metadata: IMetadata): Observable<IMetadata> {
    const url = `${this.apiUrl}/${metadata.id}`;
    return this.http.put<IMetadata>(url, metadata).pipe(
      catchError(this.handleError)
    );
  }

  // Activar metadato (cambiar de "I" a "A")
  activateMetadata(id: number): Observable<IMetadata> {
    const url = `${this.apiUrl}/active/${id}`;
    return this.http.put<IMetadata>(url, {}).pipe(
      catchError(this.handleError)
    );
  }

  // Desactivar metadato (cambiar de "A" a "I")
  deactivateMetadata(id: number): Observable<any> {
    const url = `${this.apiUrl}/inactive/${id}`;
    return this.http.delete(url).pipe(
      catchError(this.handleError)
    );
  }

  // Eliminar metadato
  deleteMetadata(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          return of({ success: true, message: 'El metadato ya fue eliminado' });
        } else {
          return throwError(error);
        }
      })
    );
  }

  // Manejo de errores centralizado
  private handleError(error: any): Observable<never> {
    let errorMessage = 'Ocurrió un error. Por favor, inténtelo de nuevo.';
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        errorMessage = 'Error de conexión. Por favor, compruebe su conexión a internet.';
      } else {
        errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}
