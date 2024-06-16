import { Component, OnInit } from '@angular/core';
import { MetadataService } from '../../services/metadata.service';
import Swal from 'sweetalert2';
import {
  IMetadata,
  ICreateMetadata,
} from '../../interfaces/metadata.interface';

@Component({
  selector: 'app-metadata-list',
  templateUrl: './metadata-list.component.html',
  styleUrls: ['./metadata-list.component.css'],
})
export class MetadataListComponent implements OnInit {
  metadataList: IMetadata[] = [];
  filteredMetadataList: IMetadata[] = [];
  paginatedMetadataList: IMetadata[] = [];
  showActive = true;
  showForm = false;
  showEditForm = false;
  newMetadataUrl: string = '';
  currentPage = 1;
  itemsPerPage = 4;
  selectedMetadata: IMetadata = {
    id: 0,
    title: '',
    publicationDate: '',
    publicationTime: '',
    imageUrl: '',
    feeds: '',
    authors: '',
    active: '',
  };
  originalMetadata: IMetadata = { ...this.selectedMetadata };

  titleFilter: string = '';
  dateFilter: string = '';

  constructor(private metadataService: MetadataService) {}

  ngOnInit(): void {
    this.loadMetadata();
  }

  loadMetadata(preserveCurrentPage = false): void {
    this.resetFilters();
    if (this.showActive) {
      this.metadataService.findAllActive().subscribe(
        (data) => {
          this.metadataList = data;
          if (!preserveCurrentPage) this.currentPage = 1;
          this.applyFilters();
          console.log('Active metadatos recuperados:', this.metadataList);
        },
        (error) => {
          console.error('Error al obtener los metadatos activos:', error);
        }
      );
    } else {
      this.metadataService.findAllInactive().subscribe(
        (data) => {
          this.metadataList = data;
          if (!preserveCurrentPage) this.currentPage = 1;
          this.applyFilters();
          console.log('Inactive metadatos recuperados:', this.metadataList);
        },
        (error) => {
          console.error('Error al obtener los metadatos inactivos:', error);
        }
      );
    }
  }

  resetFilters(): void {
    this.titleFilter = '';
    this.dateFilter = '';
  }

  searchByTitle(): void {
    this.applyFilters();
  }

  searchByDate(): void {
    this.applyFilters();
  }

  normalizeText(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\.,:\-]/g, '');
  }

  applyFilters(): void {
    let filteredMetadataList = this.metadataList;

    if (this.titleFilter) {
      const normalizedTitleFilter = this.normalizeText(
        this.titleFilter.toLowerCase()
      );
      filteredMetadataList = filteredMetadataList.filter((metadata) =>
        this.normalizeText(metadata.title.toLowerCase()).includes(
          normalizedTitleFilter
        )
      );
    }

    if (this.dateFilter) {
      filteredMetadataList = filteredMetadataList.filter((metadata) =>
        metadata.publicationDate.includes(this.dateFilter)
      );
    }

    filteredMetadataList.sort((a, b) => a.id - b.id);

    this.filteredMetadataList = filteredMetadataList;
    this.paginateMetadataList();
  }

  paginateMetadataList(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedMetadataList = this.filteredMetadataList.slice(start, end);
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.paginateMetadataList();
  }

  totalPages(): number {
    return Math.ceil(this.filteredMetadataList.length / this.itemsPerPage);
  }

  toggleActiveInactive(): void {
    this.showActive = !this.showActive;
    this.resetFilters();
    this.loadMetadata();
  }

  addMetadata(): void {
    this.showForm = true;
  }

  submitMetadata(): void {
    if (!this.newMetadataUrl) {
      Swal.fire('Advertencia', 'No has agregado ningún metadato', 'warning');
      return;
    }

    const newMetadata: ICreateMetadata = {
      url: this.newMetadataUrl,
      features: { metadata: {} },
    };

    this.metadataService.addMetadata(newMetadata).subscribe(
      () => {
        this.newMetadataUrl = '';
        this.loadMetadata(true);
        Swal.fire('¡Éxito!', 'Metadato agregado correctamente', 'success');
      },
      (error) => {
        console.error('Error al añadir el metadato:', error);
        Swal.fire(
          '¡Error!',
          'Hubo un problema al agregar el metadato',
          'error'
        );
      }
    );
  }

  confirmActivateMetadata(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Estás a punto de activar este metadato.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.activateMetadata(id);
      }
    });
  }

  confirmDeactivateOrDeleteMetadata(id: number): void {
    Swal.fire({
      title: '¿Qué acción quieres realizar?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Desactivar',
      cancelButtonText: 'Eliminar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.confirmDeactivateMetadata(id);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.confirmDeleteMetadata(id);
      }
    });
  }

  confirmDeactivateMetadata(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Estás a punto de desactivar este metadato.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deactivateMetadata(id);
      }
    });
  }

  confirmDeleteMetadata(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Estás a punto de eliminar este metadato.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteMetadata(id);
      }
    });
  }

  activateMetadata(id: number): void {
    this.metadataService.activateMetadata(id).subscribe(
      (response) => {
        console.log(`Metadato ${id} activado`, response);
        this.loadMetadata(true);
        Swal.fire('¡Éxito!', 'Metadato activado correctamente', 'success');
      },
      (error) => console.error('Error al activar metadato:', error)
    );
  }

  deactivateMetadata(id: number): void {
    this.metadataService.deactivateMetadata(id).subscribe(
      (response) => {
        console.log(`Metadato ${id} desactivado`, response);
        this.loadMetadata(true);
        Swal.fire('¡Éxito!', 'Metadato desactivado correctamente', 'success');
      },
      (error) => console.error('Error al desactivar metadato:', error)
    );
  }

  deleteMetadata(id: number): void {
    this.metadataService.deleteMetadata(id).subscribe(
      () => {
        console.log(`Metadato ${id} eliminado`);
        this.loadMetadata(true);
        Swal.fire('¡Éxito!', 'Metadato eliminado correctamente', 'success');
      },
      (error) => {
        console.error('Error al eliminar metadato:', error);
        Swal.fire('¡Error!', 'Hubo un problema al eliminar el metadato', 'error');
      }
    );
  }

  editMetadata(id: number): void {
    console.log('Edit metadata with ID:', id);
    const metadata = this.metadataList.find((metadata) => metadata.id === id);
    if (metadata) {
      this.selectedMetadata = {
        ...metadata,
        publicationDate: this.formatDate(metadata.publicationDate),
        publicationTime: this.formatTime(metadata.publicationDate),
      };
      this.originalMetadata = {
        ...metadata,
        publicationDate: this.formatDate(metadata.publicationDate),
        publicationTime: this.formatTime(metadata.publicationDate),
      };
      this.showEditForm = true;
    }
  }

  formatDate(dateTimeString: string): string {
    if (!dateTimeString) {
      return 'Sin Fecha de Publicación';
    }
    return dateTimeString.split('T')[0];
  }

  formatTime(dateTimeString: string): string {
    if (!dateTimeString) {
      return '';
    }
    return dateTimeString.split('T')[1].substring(0, 5);
  }

  updateMetadata(): void {
    console.log('Update metadata:', this.selectedMetadata);

    if (
      this.selectedMetadata.title === this.originalMetadata.title &&
      this.selectedMetadata.publicationDate ===
        this.originalMetadata.publicationDate &&
      this.selectedMetadata.publicationTime ===
        this.originalMetadata.publicationTime &&
      this.selectedMetadata.imageUrl === this.originalMetadata.imageUrl
    ) {
      Swal.fire('Información', 'No se han realizado cambios', 'info');
      return;
    }

    if (
      this.selectedMetadata.publicationDate &&
      this.selectedMetadata.publicationTime
    ) {
      this.selectedMetadata.publicationDate = `${this.selectedMetadata.publicationDate}T${this.selectedMetadata.publicationTime}`;
    }

    try {
      this.selectedMetadata.feeds = JSON.parse(this.selectedMetadata.feeds);
      this.selectedMetadata.authors = JSON.parse(this.selectedMetadata.authors);
    } catch (error) {
      console.error('Error parsing feeds or authors:', error);
      Swal.fire('¡Error!', 'Hubo un problema al parsear los datos', 'error');
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Estás a punto de actualizar este metadato.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.metadataService.updateMetadata(this.selectedMetadata).subscribe(
          (response) => {
            console.log('Metadato actualizado:', response);
            this.loadMetadata(true);
            Swal.fire(
              '¡Éxito!',
              'Metadato actualizado correctamente',
              'success'
            );
          },
          (error) => {
            console.error('Error al actualizar metadato:', error);
            Swal.fire(
              '¡Error!',
              'Hubo un problema al actualizar el metadato',
              'error'
            );
          }
        );
      }
    });
  }

  truncateTitle(title: string, maxLength: number): string {
    return title.length > maxLength
      ? `${title.substring(0, maxLength)}...`
      : title;
  }

  displayFeeds(feeds: string): string[] {
    if (!feeds || feeds === '[]') {
      return ['Sin Feeds'];
    }
    try {
      const parsedFeeds = JSON.parse(feeds);
      const maxLength = 30;
      const formattedFeeds = parsedFeeds.map((feed: { link: string }) => {
        let formattedLink = feed.link;
        if (formattedLink.length > maxLength) {
          formattedLink = formattedLink.substring(0, maxLength) + '...';
        }
        return formattedLink;
      });
      return formattedFeeds;
    } catch (e) {
      console.error('Error parsing feeds:', e);
      return ['Invalid feeds format'];
    }
  }

  displayAuthors(authors: string): string {
    if (!authors || authors === '[]') {
      return 'Sin Autores';
    }
    try {
      const parsedAuthors = JSON.parse(authors);
      const authorNames = parsedAuthors.map((author: any) => author.name);
      const maxLength = 18;
      let formattedAuthors = authorNames.join(', ');
      if (formattedAuthors.length > maxLength) {
        formattedAuthors = formattedAuthors.substring(0, maxLength) + '...';
      }
      return formattedAuthors;
    } catch (e) {
      console.error('Error parsing authors:', e);
      return 'Invalid authors format';
    }
  }
}
