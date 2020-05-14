// One big cool file that has it all.

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
class ProjectState {
    private listeners: any[] = [];
    private projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {}

    // 'singleton constructor' 
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }

    addListener(listenerFn: Function) {
        this.listeners.push(listenerFn);
    }
    
    addProject(title: string, description: string, numOfPeople: number) {
        const newProject = new Project( Math.random().toString(),
                                        title,
                                        description,
                                        numOfPeople,
                                        ProjectStatus.Active);
        this.projects.push(newProject);
        
        for (const listenerFn of this.listeners) {
            // slice makes copy? [...] cleaner?
            listenerFn(this.projects.slice());
        }
    }
}
// global constant state
const projectState = ProjectState.getInstance();


// ProjectList class
class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLElement;
    element: HTMLElement;
    assignedProjects: Project[] = [];

    constructor(private type: 'active' | 'finished') {
        // type casting
        this.templateElement = document.getElementById('project-list') as HTMLTemplateElement;
        // used ! because we know it won't be null
        this.hostElement = document.getElementById('app')!;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLElement;
        this.element.id = `${this.type}-projects`;

        projectState.addListener((projects: any[]) => {
            this.assignedProjects = projects;
            this.renderProjects();
        });

        this.renderContent();
        this.attach();
    }

    private renderProjects() {
        const listElement = document.getElementById(`${this.type}-projects-list`) as HTMLElement;
        for(const projectItem of this.assignedProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = projectItem.title;
            listElement.appendChild(listItem);
        }
    }
    
    private renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`;
    }

    private attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element)
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


class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLElement;
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        // type casting
        this.templateElement = document.getElementById('project-input') as HTMLTemplateElement;
        // used ! because we know it won't be null
        this.hostElement = document.getElementById('app')!;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.element.id = 'user-input';

        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

        this.configure();
        this.attach();
    }
    
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

    private configure() {
        // example uses (old skool) this.submitHandler.bind(this)
        this.element.addEventListener('submit', (event) => this.submitHandler(event));
        
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element)
    }
}

const project = new ProjectInput();

const activeList = new ProjectList('active');
const finishedList = new ProjectList('finished');