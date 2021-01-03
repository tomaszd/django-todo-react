// frontend/src/App.js
import React, { Component } from "react";
import Modal from "./components/Modal";
import axios from "axios";

const BACKEND_URL = "https://djangodwadwa.herokuapp.com";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewCompleted: false,
      activeItem: {
        title: "",
        description: "",
        completed: false,
        priority: "",
        category: "",
      },
      todoList: [],
    };
  }
  componentDidMount() {
    this.refreshList();
  }
  truncate = function (str) {
    let max_length = 35;
    return str.length > max_length ? str.substring(0, max_length - 3) + "..." : str;
  };
  compareTasks = function (a, b) {
    let int_prio_a = a.priority;
    let int_prio_b = b.priority;
    switch (int_prio_a) {
      case "Low":
        int_prio_a = 1;
        break;
      case "Medium":
        int_prio_a = 2;
        break;
      case "High":
        int_prio_a = 3;
        break;
      default:
        int_prio_a = 0;
        console.log("unsupported priority: " + int_prio_a);
    }
    switch (int_prio_b) {
      case "Low":
        int_prio_b = 1;
        break;
      case "Medium":
        int_prio_b = 2;
        break;
      case "High":
        int_prio_b = 3;
        break;
      default:
        int_prio_b = 0;
        console.log("unsupported priority: " + int_prio_b);
    }
    if (int_prio_a > int_prio_b) {
      return -1;
    }
    if (int_prio_a < int_prio_b) {
      return 1;
    }
    return 0;
  };

  refreshList = () => {
    axios
      .get(BACKEND_URL + "/api/todos/")
      .then((res) =>
        this.setState({
          todoList: res.data,
        })
      )
      .catch((err) => console.log(err));
  };

  displayCompleted = (status) => {
    if (status) {
      return this.setState({
        viewCompleted: true,
      });
    }
    return this.setState({
      viewCompleted: false,
    });
  };
  renderTabList = () => {
    return (
      <div className="my-5 tab-list ">
        <span onClick={() => this.displayCompleted(true)} className={this.state.viewCompleted ? "active" : ""}>
          Show completed{" "}
        </span>
        <span onClick={() => this.displayCompleted(false)} className={this.state.viewCompleted ? "" : "active"}>
          Show tasks to do
        </span>

        <button onClick={this.createItem} className="float-right btn btn-primary mr-5 mx-auto">
          Add task
        </button>
        {"  "}
        <button
          onClick={this.deleteCompleted}
          className={`float-right btn btn-danger mr-5  mx-auto ${this.state.viewCompleted ? "visible" : "invisible"}`}
        >
          Clear Completed
        </button>
      </div>
    );
  };
  renderItems = () => {
    const { viewCompleted } = this.state;
    const newItems = this.state.todoList.filter((item) => item.completed === viewCompleted);
    return newItems.sort(this.compareTasks).map((item) => (
      <li
        key={item.id}
        className={`list-group-item d-flex justify-content-between align-items-center prio${item.priority} ${
          item.category === "Work" ? "category-work" : ""
        } ${item.category === "Home" ? "category-home" : ""}`}
      >
        <span
          className={`todo-title mr-2 ${this.state.viewCompleted ? "completed-todo" : ""}`}
          title={item.description}
        >
          {item.category != null ? item.category + "-" : ""}
          {this.truncate(item.title)}
        </span>
        <span>
          <button onClick={() => this.handleToggle(item)} className="btn btn-secondary btn-sm btn-success btn-block">
            {item.completed ? "Not completed" : "Complete Task"}
          </button>{" "}
          <button onClick={() => this.editItem(item)} className="btn btn-primary btn-block btn-sm">
            Edit{" "}
          </button>{" "}
          <button onClick={() => this.handleDelete(item)} className="btn btn-danger btn-block btn-sm">
            Remove{" "}
          </button>
        </span>{" "}
      </li>
    ));
  };
  toggle = () => {
    this.setState({
      modal: !this.state.modal,
    });
  };
  handleSubmit = (item) => {
    this.toggle();
    if (item.id) {
      axios.put(BACKEND_URL + `/api/todos/${item.id}/`, item).then((res) => this.refreshList());
      return;
    }
    axios.post(BACKEND_URL + "/api/todos/", item).then((res) => this.refreshList());
  };
  handleDelete = (item) => {
    axios.delete(BACKEND_URL + `/api/todos/${item.id}`).then((res) => this.refreshList());
  };
  createItem = () => {
    const item = {
      title: "",
      description: "",
      completed: false,
      priority: "Low",
    };
    this.setState({
      activeItem: item,
      modal: !this.state.modal,
    });
  };
  deleteCompleted = () => {
    console.log("delete item");
    axios.post(BACKEND_URL + "/api/todos_completed/?delete_all=1", {}).then((res) => this.refreshList());
    this.displayCompleted(false);
  };
  editItem = (item) => {
    this.setState({
      activeItem: item,
      modal: !this.state.modal,
    });
  };
  handleToggle = (item) => {
    item.completed = !item.completed;
    if (item.id) {
      axios.put(BACKEND_URL + `/api/todos/${item.id}/`, item).then((res) => this.refreshList());
      return;
    }
  };

  render() {
    return (
      <main className="content">
        <h1 className="text-white text-uppercase text-center my-4"> Todo app </h1>{" "}
        <div className="row ">
          <div className="col-md-6 col-sm-10 mx-auto p-0">
            <div className="card p-3">
              {this.renderTabList()} <ul className="list-group list-group-flush"> {this.renderItems()} </ul>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        {this.state.modal ? (
          <Modal activeItem={this.state.activeItem} toggle={this.toggle} onSave={this.handleSubmit} />
        ) : null}{" "}
      </main>
    );
  }
}
export default App;
