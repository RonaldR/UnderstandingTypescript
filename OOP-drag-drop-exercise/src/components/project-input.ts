import { Component } from './base-component.js';
import { Validatable, validate } from '../util/validation.js';
import { projectState } from '../state/project-state.js';

// ProjectInput class

export class ProjectInput extends Component<HTMLFormElement> {
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