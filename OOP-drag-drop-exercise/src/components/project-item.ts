import { Draggable } from '../models/drag-drop.js';
import { Component } from './base-component.js';
import {Project} from '../models/project.js';

// ProjectItem Class
export class ProjectItem extends Component<HTMLLIElement> implements Draggable {
    private project: Project;

    // convention: getters / setters below class fields above functions
    get peoplePerson() {
        return `${this.project.people} person${this.project.people > 1 ? 's' : ''}`
    }

    constructor(hostId: string, project: Project) {
        super('single-project', hostId, false, project.id);

        this.project = project;

        this.configure();
        this.renderContent();
    }

    dragStartHandler(event: DragEvent) {
        event.dataTransfer!.setData('text/plain', this.project.id);
        event.dataTransfer!.effectAllowed = 'move';
    }

    dragEndHandler(_event: DragEvent) {
        const droppableElements = document.querySelectorAll('.droppable')!;
        for(const droppableElement of droppableElements) {
            droppableElement.classList.remove('droppable');
        }
    }

    configure() {
        this.element.addEventListener('dragstart', (event) => this.dragStartHandler(event));
        this.element.addEventListener('dragend', (event) => this.dragEndHandler(event));
    }

    renderContent() {
        this.element.querySelector('h2')!.textContent = this.project.title;
        this.element.querySelector('h3')!.textContent = `${this.peoplePerson} assigned`;
        this.element.querySelector('p')!.textContent = this.project.description;
    }
}