// Component Base Class, abstract so you can't instantiate it.
export abstract class Component<T extends HTMLElement> {
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