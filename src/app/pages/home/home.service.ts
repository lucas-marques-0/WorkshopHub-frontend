import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HomeService {

  constructor(private http: HttpClient) { }

  private apiUrl = 'http://localhost:5143/api'

  async registerWorkshop(workshopInfos: Object): Promise<any> {
    try {
      return await this.http.post(`${this.apiUrl}/Workshops`, workshopInfos).toPromise();
    } catch (error) {
      console.error('Erro ao buscar workshops:', error);
    }
  }

  async createAta(ataInfos: Object): Promise<any> {
    try {
      return await this.http.post(`${this.apiUrl}/Atas`, ataInfos).toPromise();
    } catch (error) {
      console.error('Erro ao criar ata:', error);
    }
  }

  async registerEmployee(employeeInfos: Object): Promise<any> {
    try {
      return await this.http.post(`${this.apiUrl}/Colaboradores`, employeeInfos).toPromise();
    } catch (error) {
      console.error('Erro ao registrar colaborador:', error);
    }
  }

  async registerEmployeeToAta(ataId: number | undefined, employeeId: number): Promise<any> {
    try {
      return await this.http.put(`${this.apiUrl}/Atas/${ataId}/colaboradores/${employeeId}`, {}).toPromise();
    } catch (error) {
      console.error('Erro ao registrar colaborador a ata:', error);
    }
  }

  async removeEmployeeAtAta(ataId: number | undefined, employeeId: number): Promise<any> {
    try {
      return await this.http.delete(`${this.apiUrl}/Atas/${ataId}/colaboradores/${employeeId}`).toPromise();
    } catch (error) {
      console.error('Erro ao remover colaborador de ata:', error);
    }
  }

  async getEmployeesInfos(): Promise<any> {
    try {
      return await this.http.get(`${this.apiUrl}/Colaboradores`).toPromise();
    } catch (error) {
      console.error('Erro ao buscar informações dos colaboradores:', error);
    }
  }

  async getAtaParticipationsByName(workshopName: string): Promise<any> {
    const params = new HttpParams().set('workshopNome', workshopName);
    try {
      return await this.http.get(`${this.apiUrl}/Atas/get-by-name`, { params }).toPromise();
    } catch (error) {
      console.error('Erro ao buscar participantes de ata pelo nome do workshop:', error);
    }
  }

  async getAtaParticipationsByDate(workshopDate: string): Promise<any> {
    const params = new HttpParams().set('workshopDate', workshopDate);
    try {
      return await this.http.get(`${this.apiUrl}/Atas/get-by-date`, { params }).toPromise();
    } catch (error) {
      console.error('Erro ao buscar participantes de ata pela data do workshop', error);
    }
  }
}
