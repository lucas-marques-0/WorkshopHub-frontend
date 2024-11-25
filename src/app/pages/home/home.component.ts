import { Component } from '@angular/core';
import { HomeService } from './home.service';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Workshop, Colaborador, Ata } from './types';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  constructor(private homeService: HomeService) {}

  // Pesquisas
  employeeSearch: string = '';
  workshopSearch: string = '';
  dateSearch: string  =  '';

  // Listas
  workshopList: Workshop[] = [];
  employeeList: Colaborador[] = [];
  employeesInfos: { colaborador: Colaborador; workshops: Workshop[] }[] = [];
  ataEmployeesToRemove: Colaborador[] = [];
  ataEmployeesToAdd: Colaborador[] = [];
  ataList: Ata[] = [];
  filteredAtaList: Ata[] = [];
  searchedAtaParticipations: Colaborador[] = [];

  // Modais e Flags
  addingWorkshop: boolean = false;
  addingEmployee: boolean = false;
  addingEmployeeToAta: boolean = false;
  removingEmployeeToAta: boolean = false;
  addingAta: boolean = false;
  showingEmployees: boolean = false;
  showingParticipations: boolean = false;

  // Inputs dos modais
  workshopName: string = '';
  workshopDate: string | null = null; 
  workshopDescription: string = '';

  workshopNameFilter: string = '';
  workshopDateFilter: string | null = null;

  employeeName: string = '';

  ataIdToAddEmployee: number | undefined = undefined;
  ataIdToRemoveEmployee: number | undefined = undefined;

  openAddWorkshopModal() {
    this.addingWorkshop = true
  }

  openAddAtaModal() {
    this.addingAta = true
  }

  openAddEmployeeModal() {
    this.addingEmployee = true
  }

  async openSeeEmployeesModal() {
    const employeesInfos = await this.homeService.getEmployeesInfos();
    this.employeesInfos = employeesInfos
    this.showingEmployees = true
  }

  openSeeParticipationsModal() {
    this.showingParticipations = true
  }

  filterAtas() {
    const filledFields = [
      this.employeeSearch.trim(),
      this.workshopSearch.trim(),
      this.dateSearch
    ].filter(field => field !== '');
  
    if (filledFields.length > 1) {
      this.employeeSearch = '';
      this.workshopSearch = '';
      this.dateSearch = '';
      this.showAlert('Escolha apenas um tipo de pesquisa!', 'info');
      return;
    }
  
    if (filledFields.length === 0) {
      this.showAlert('Preencha pelo menos um campo para filtrar!', 'info');
      return;
    }

    if (this.employeeSearch.trim()) {
      this.filterByEmployee();
    } else if (this.workshopSearch.trim()) {
      this.filterByWorkshop();
    } else if (this.dateSearch) {
      this.filterByDate();
    }
  }

  filterByEmployee() {
    const filteredAtas = this.ataList.filter(ata =>
      ata.colaboradores.some((colaborador: any) =>
        colaborador.nome.toLowerCase().includes(this.employeeSearch.toLowerCase())
      )
    );
  
    if (filteredAtas.length === 0) {
      this.showAlert('Nenhuma ata encontrada para o colaborador informado.', 'info');
      this.filteredAtaList = []
    } else {
      this.filteredAtaList = filteredAtas
    }
  }
  
  filterByWorkshop() {
    const filteredAtas = this.ataList.filter(ata =>
      ata.workshop.nome.toLowerCase().includes(this.workshopSearch.toLowerCase())
    );
    if (filteredAtas.length === 0) {
      this.showAlert('Nenhuma ata encontrada para o workshop informado.', 'info');
      this.filteredAtaList = []
    } else {
      this.filteredAtaList = filteredAtas
    }
  }
  
  filterByDate() {
    const formattedDate = this.formatDateToIsos(this.dateSearch);
    const filteredAtas = this.ataList.filter(ata => {
      const ataDate = ata.workshop.dataRealizacao.substring(0, 10);
      return ataDate === formattedDate;
    });
  
    if (filteredAtas.length === 0) {
      this.showAlert('Nenhuma ata encontrada para a data informada.', 'info');
      this.filteredAtaList = []
    } else {
      this.filteredAtaList = filteredAtas
    }
  }

  removeFilterAtas() {
    this.filteredAtaList = []
  }

  handleAddEmployeeToAta(ata: any) {
    this.ataIdToAddEmployee = ata.id
    const ataColaboradoresIds = (ata.colaboradores || []).map((colaborador: any) => colaborador.id);
    this.ataEmployeesToAdd = this.employeeList.filter((employee: any) => 
      !ataColaboradoresIds.includes(employee.id)
    );
    this.addingEmployeeToAta = true
  }

  handleRemoveEmployeeToAta(ata: any) {
    this.ataIdToRemoveEmployee = ata.id
    this.ataEmployeesToRemove = ata.colaboradores
    this.removingEmployeeToAta = true
  }

  async confirmWorkshop() {
    if(!this.workshopName || !this.workshopDate || !this.workshopDescription) {
      this.showAlert('Preencha todos os campos!', 'info')
    } else {
      const registerWorkshop = await this.homeService.registerWorkshop({
        id: Math.floor(Date.now() / 1000),
        nome: this.workshopName,
        dataRealizacao: this.formatDateToIsos(this.workshopDate),
        descricao: this.workshopDescription,
      });
      this.workshopList = registerWorkshop
      this.resetAll()
    }
  }

  async confirmEmployee() {
    if(!this.employeeName) {
      this.showAlert('Coloque o nome do colaborador!', 'info')
    } else {
      const registerEmployee = await this.homeService.registerEmployee({
        id: Math.floor(Date.now() / 1000),
        nome: this.employeeName
      });
      this.employeeList = registerEmployee
      this.resetAll()
    }
  }

  async confirmAddEmployeeToAta(employeeInfos: any) {
    const newAtaList = await this.homeService.registerEmployeeToAta(
      this.ataIdToAddEmployee, 
      employeeInfos.id
    );
    this.ataList = newAtaList
    this.ataIdToAddEmployee = undefined
    this.resetAll()
  }

  async confirmRemoveEmployeeToAta(employeeInfos: any) {
    const newAtaList = await this.homeService.removeEmployeeAtAta(
      this.ataIdToRemoveEmployee, 
      employeeInfos.id
    );
    this.ataList = newAtaList
    this.ataIdToRemoveEmployee = undefined
    this.resetAll()
  }

  async handleCreateAta(workshopObject: any) {
    const createAta = await this.homeService.createAta({
      id: Math.floor(Date.now() / 1000),
      workshop: workshopObject,
      colaboradores: []
    });
    this.ataList = createAta
    this.resetAll()
  }

  async getWorkshopsParticipations() {
    if(this.workshopNameFilter && this.workshopDateFilter) {
      this.showAlert('Escolha apenas uma forma de buscar, pelo nome OU data!', 'info')
      this.workshopNameFilter = ''
      this.workshopDateFilter = ''
    }
    if(this.workshopNameFilter && !this.workshopDateFilter) {
      const foundAtaOfWorkshop = await this.homeService.getAtaParticipationsByName(this.workshopNameFilter)
      if(!foundAtaOfWorkshop) {
        this.showAlert('Nenhum workshop com ata ativa encontrado com esse nome!', 'error')
        this.searchedAtaParticipations = []
      } else if(foundAtaOfWorkshop.length == 0) { 
        this.showAlert('Nenhum colaborador cadastrado na ata desse workshop!', 'info')
        this.searchedAtaParticipations = []
      } else this.searchedAtaParticipations = foundAtaOfWorkshop;
    }
    if(!this.workshopNameFilter && this.workshopDateFilter) {
      const foundAtaOfWorkshop = await this.homeService.getAtaParticipationsByDate(this.formatDateToIsos(this.workshopDateFilter))
      if(!foundAtaOfWorkshop) {
        this.showAlert('Nenhum workshop com ata ativa encontrado com essa data!', 'error')
        this.searchedAtaParticipations = []
      } else if(foundAtaOfWorkshop.length == 0) {
        this.showAlert('Nenhum colaborador cadastrado na ata desse workshop!', 'info')
        this.searchedAtaParticipations = []
      } else this.searchedAtaParticipations = foundAtaOfWorkshop;
    }
  }

  formatDateToIsos(date: string): string {
    const dateObj = new Date(date);
    const year = dateObj.getUTCFullYear();  
    const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getUTCDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString); 
    const day = String(date.getDate()).padStart(2, '0'); 
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const year = date.getFullYear();
    return `${day}/${month}/${year}`; 
  }

  resetAll() {
    this.addingWorkshop = false
    this.addingEmployee = false
    this.addingAta = false
    this.showingEmployees = false
    this.addingEmployeeToAta = false
    this.removingEmployeeToAta = false
    this.showingParticipations = false
    this.workshopDate = null
    this.workshopName = ''
    this.workshopDescription = ''
    this.employeeName = ''
    this.workshopDateFilter = ''
    this.workshopNameFilter = ''
    this.searchedAtaParticipations = []
  }

  showAlert(message: any, type: any) {
    Swal.fire({
      title: message,
      icon: type,
      confirmButtonText: 'Ok!'
    });
  }
}
