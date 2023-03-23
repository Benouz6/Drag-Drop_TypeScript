// Enumerable to set the status of a project

enum ProjectStatus {
  Active,
  Finished,
}

// Type listener to return nothing
type Listener = (items: Project[]) => void;

// Project Class to hold a project
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public numOfPeople: number,
    public status: ProjectStatus
  ) {}
}

// Project State Management

class ProjectState {
  private listeners: Listener[] = [];
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addListener(listenerFn: Listener) {
    this.listeners.push(listenerFn);
  }

  addProject(title: string, description: string, people: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      people,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

// AutoBind Decorator

function AutoBind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

// const inputValidator: Validatable = {};

function validate(validateInput: Validatable) {
  let isValid = true;
  if (validateInput.required) {
    isValid = isValid && validateInput.value.toString().trim().length !== 0;
  }
  if (validateInput.minLength && typeof validateInput.value === "string") {
    isValid =
      isValid &&
      validateInput.value.toString().trim().length > validateInput.minLength;
  }
  if (validateInput.maxLength && typeof validateInput.value === "string") {
    isValid =
      isValid &&
      validateInput.value.toString().trim().length < validateInput.maxLength;
  }
  if (validateInput.max && typeof validateInput.value === "number") {
    isValid =
      isValid &&
      validateInput.value.toString().trim().length < validateInput.max;
  }
  if (validateInput.min && typeof validateInput.value === "number") {
    isValid =
      isValid &&
      validateInput.value.toString().trim().length < validateInput.min;
  }
  return isValid;
}

// Component Base CLass

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hotsElementId: string,
    position: boolean,
    newElementId?: string
  ) {
    this.templateElement = document.getElementById(
      templateId
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hotsElementId)! as T;
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }
    this.attach(position);
  }
  private attach(position: boolean) {
    this.hostElement.insertAdjacentElement(
      position ? "afterbegin" : "beforeend",
      this.element
    );
  }
  abstract configure(): void;
  abstract renderContent(): void;
}

// Create a class for the list
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProject: Project[];
  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);
    this.templateElement, this.hostElement, this.element;
    this.assignedProject = [];
    projectState.addListener((projects: Project[]) => {
      const relevantProject = projects.filter((project) => {
        if (this.type === "active") {
          return project.status === ProjectStatus.Active;
        }
        return project.status === ProjectStatus.Finished;
      });

      this.assignedProject = relevantProject;
      this.renderProjects();
    });
    this.configure();
    this.renderContent();
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = "";
    for (const project of this.assignedProject) {
      const listItem = document.createElement("li");
      listItem.textContent = project.title;
      listEl.appendChild(listItem);
    }
  }
  configure() {
    projectState.addListener((projects: Project[]) => {
      const relevantProject = projects.filter((project) => {
        if (this.type === "active") {
          return project.status === ProjectStatus.Active;
        }
        return project.status === ProjectStatus.Finished;
      });

      this.assignedProject = relevantProject;
      this.renderProjects();
    });
  }

  renderContent() {
    const listId = this.element.querySelector("ul")!;
    listId.id = `${this.type}-projects-list`;
    this.element.querySelector(
      "h2"
    )!.innerHTML = `${this.type.toUpperCase()} PROJECTS`;
  }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  // templateElement: HTMLTemplateElement;
  // hostElement: HTMLDivElement;
  // element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    // Render the HTML at the first place
    super("project-input", "app", true, "user-input");
    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;
    this.configure();
  }
  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }
  renderContent(): void {}

  // Retrieve the input, check if it's goood and Return a tupple or void as undefined
  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;
    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
      minLength: 3,
    };
    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true,
      minLength: 5,
      maxLength: 200,
    };
    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 2,
      max: 11,
    };

    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert("Please fill out all the input");
      return;
    } else {
      return [enteredTitle, enteredDescription, +enteredPeople];
    }
  }

  // Clear the input fields
  private clearInput() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  @AutoBind
  private submitHandler(event: Event) {
    event.preventDefault();
    const validUserInput = this.gatherUserInput();
    if (Array.isArray(validUserInput)) {
      const [title, desc, people] = validUserInput;
      this.clearInput();
      projectState.addProject(title, desc, people);
    }
  }
}

const project = new ProjectInput();
const actProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");
