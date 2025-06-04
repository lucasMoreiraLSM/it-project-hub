
import { Project } from '@/types/project';

export interface ProjectSectionProps {
  project: Project;
  onUpdate: (field: keyof Project, value: any) => void;
  canEdit: boolean;
}

export interface ListSectionProps extends ProjectSectionProps {
  addToList: (field: keyof Project, newItem: any) => void;
  removeFromList: (field: keyof Project, index: number) => void;
  updateListItem: (field: keyof Project, index: number, value: any) => void;
}
