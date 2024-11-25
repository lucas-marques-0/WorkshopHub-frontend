export interface Workshop {
  id: number;
  nome: string;
  dataRealizacao: string; 
  descricao: string;
}

export interface Colaborador {
  id: number;
  nome: string;
}

export interface Ata {
  id: number;
  workshop: Workshop;
  colaboradores: Colaborador[];
}
