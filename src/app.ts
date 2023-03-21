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

// Create a class for the list
class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  constructor(private type: "active" | "finished") {
    this.templateElement = document.getElementById(
      "project-list"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;
    this.attach();
    this.renderContent();
  }

  private renderContent() {
    const listId = this.element.querySelector("ul")!;
    listId.id = `${this.type}-projects-lisy`;
    const h2 = (this.element.querySelector(
      "h2"
    )!.innerHTML = `${this.type.toUpperCase()} PROJECTS`);
    console.log(h2);
  }

  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.element);
  }
}

// Create a class for the items in the list
// class Project {
//   title: string;
//   description: string;
//   people: number;
//   constructor(title: string, description: string, people: number) {
//     this.title = title as string;
//     this.description = description as string;
//     this.people = people as number;
//   }
// }

// Store the input into a class

class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    // Render the HTML
    this.templateElement = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.setAttribute("id", "user-input");
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
    this.attach();
  }

  // Check if the inputs are valid

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

  // Clear the inout fields
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

      console.log(title, desc, people);
    }
  }

  private configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

const project = new ProjectInput();
const actProjectList = new ProjectList('active')
const finishedProjectList = new ProjectList('finished')
