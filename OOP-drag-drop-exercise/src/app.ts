// One big cool file that has it all.


// Drag and Drop Interfaces
interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
}


// Project Type
enum ProjectStatus { Active, Finished };

class Project {
    constructor(public id: string, 
                public title: string, 
                public description: string, 
                public people: number, 
                public status: ProjectStatus)  {

    }
}

// Project State Management
type Listener<T> = (items: T[]) => void;

class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}

class ProjectState extends State<Project> {
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {
        super();
    }

    // 'singleton constructor' 
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    
    addProject(title: string, description: string, numOfPeople: number) {
        const newProject = new Project( Math.random().toString(),
                                        title,
                                        description,
                                        numOfPeople,
                                        ProjectStatus.Active);
        this.projects.push(newProject);
        this.updateListeners();
    }

    moveProject(id: string, newStatus: ProjectStatus) {
        const project = this.projects.find(project => project.id === id);
        if (project && project.status !== newStatus) {
            project.status = newStatus;
            this.updateListeners();
        }
    }

    private updateListeners() {
        for (const listenerFn of this.listeners) {
            // slice makes copy? [...] cleaner?
            listenerFn(this.projects.slice());
        }
    }

}
// global constant state
const projectState = ProjectState.getInstance();


// Component Base Class, abstract so you can't instantiate it.
abstract class Component<T extends HTMLElement> {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLElement;
    element: T;

    constructor(templateId: string, hostElementId: string, insertAtBegin: boolean, newElementId?: string) {
        // type casting
        this.templateElement = document.getElementById(templateId) as HTMLTemplateElement;
        // used ! because we know it won't be null
        this.hostElement = document.getElementById(hostElementId) as HTMLElement;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as T;
        if (newElementId) {
            this.element.id = newElementId;
        }

        this.attach(insertAtBegin);
    }

    private attach(insertAtBegin: boolean) {
        this.hostElement.insertAdjacentElement(insertAtBegin ? 'afterbegin' : 'beforeend', this.element)
    }

    abstract configure(): void;
    abstract renderContent(): void;
}

// ProjectItem Class
class ProjectItem extends Component<HTMLLIElement> implements Draggable {
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

// ProjectList class
class ProjectList extends Component<HTMLElement> implements DragTarget {
    assignedProjects: Project[] = [];

    constructor(private type: 'active' | 'finished') {
        super('project-list', 'app', false, `${type}-projects`);
        
        this.configure();
        this.renderContent();
    }

    dragOverHandler(event: DragEvent) {
        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            event.preventDefault(); // drop event is only called with preventDefault
            const listElement = this.element.querySelector('ul')!;
            listElement.classList.add('droppable');
        }
    }

    dragLeaveHandler(_event: DragEvent) {
        const listElement = this.element.querySelector('ul')!;
        listElement.classList.remove('droppable');
    }

    dropHandler(event: DragEvent) {
        const projectId = event.dataTransfer!.getData('text/plain');
        projectState.moveProject(projectId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
    }

    configure() {
        this.element.addEventListener('dragover', (event) => this.dragOverHandler(event));
        this.element.addEventListener('dragleave', (event) => this.dragLeaveHandler(event));
        this.element.addEventListener('drop',(event) => this.dropHandler(event));

        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter(prj => {
                if (this.type === 'active') {
                    return prj.status === ProjectStatus.Active;
                }
                return prj.status === ProjectStatus.Finished;
            });
            
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });
    }
    
    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`;
    }

    private renderProjects() {
        const listElement = document.getElementById(`${this.type}-projects-list`) as HTMLUListElement;
        listElement.innerHTML = '';

        for(const projectItem of this.assignedProjects) {
            new ProjectItem(this.element.querySelector('ul')!.id, projectItem);
        }
    }
}


// ProjectInput class

// Validation
interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

function validate(validateInput: Validatable) {
    let isValid = true;

    if (validateInput.required) {
        isValid = isValid && validateInput.value.toString().trim().length !== 0;
    }

    // != is null && undefined check (this could be 0)
    if (validateInput.minLength != null && typeof validateInput.value === 'string') {
        isValid = isValid && validateInput.value.trim().length >= validateInput.minLength;
    }
    if (validateInput.maxLength != null && typeof validateInput.value === 'string') {
        isValid = isValid && validateInput.value.length <= validateInput.maxLength;
    }

    if (validateInput.min != null && typeof validateInput.value === 'number') {
        isValid = isValid && validateInput.value >= validateInput.min;
    }
    if (validateInput.max != null && typeof validateInput.value === 'number') {
        isValid = isValid && validateInput.value <= validateInput.max;
    }

    return isValid;
}


class ProjectInput extends Component<HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        super('project-input', 'app', true, 'user-input');

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

        this.configure();
    }

    // 'kind of convention to have public methods first'
    
    configure() {
        // example uses (old skool) this.submitHandler.bind(this)
        this.element.addEventListener('submit', (event) => this.submitHandler(event));
    }

    renderContent() {}

    private getUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;

        const titleValidate: Validatable = {
            value: enteredTitle,
            required: true,
            maxLength: 50,
        };
        const descriptionValidate: Validatable = {
            value: enteredTitle,
            required: true,
            minLength: 1,
            maxLength: 200,
        };
        const peopleValidate: Validatable = {
            value: +enteredPeople,
            required: true, min: 1,
            max: 9,
        };

        if (!validate(titleValidate) ||
            !validate(descriptionValidate) ||
            !validate(peopleValidate)) {
            alert('Invalid input');
            return;
        } else {
            return [enteredTitle, enteredDescription, +enteredPeople];
        }
    }

    private clearInputs() {
        this.titleInputElement.value = '';
        this.descriptionInputElement.value = '';
        this.peopleInputElement.value = '';
    }

    // decorator (used in example)
    // @autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInput = this.getUserInput();
        // userInput is a tuple = array in js or undefined (void in ts)
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people);
            this.clearInputs();
        }
    }
}

const project = new ProjectInput();

const activeList = new ProjectList('active');
const finishedList = new ProjectList('finished');


// autobind decorator (not using this but keeping it for reference as it is in the example)
function autobind(_target: any, _methodName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjDescriptor;
}