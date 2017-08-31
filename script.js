/* script file for index.html */

$(document).ready(updatePluses);

var app = {};

app.collArray = [
  "#todo-collection",
  "#progress-collection",
  "#review-collection",
  "#done-collection"
];

// Model
app.TodoModel = Backbone.Model.extend({
  defaults: {
    heading: '',
    content: '',
    author: '',
    status: 'todo'
  },
  updateStatus: function (statusString) {
    this.save({ status: statusString});
  }
});

// Collection
app.TodoCollection = Backbone.Collection.extend({
  model: app.TodoModel,
  localStorage: new Store("real-todo"),
  returnList: function (statusString) {
    return this.filter( function(todomodel) {
      return ( todomodel.get("status") === statusString );
    });
  }
});

app.todoList = new app.TodoCollection();

app.ItemView = Backbone.View.extend({
  tagName: 'li',
  itemTemplate: _.template($("#childTemplate").html()),
  initialize: function () {
    this.model.on('movedEvent', this.moved, this);
    this.model.on('change', this.render, this);
    this.model.on('destroy', this.remove, this);
  },
  events: {
    'click .close-button': 'destroyItem',
    'dblclick .card-title': 'editModel',
    'dblclick p': 'editModel',
    'dblclick .task-author': 'editModel',
    'blur .hidden-input': 'changeModel',
    'keypress .hidden-input': 'changeModelOnEnter'
  },
  render: function () {
    this.$el.addClass("collection-item");
    this.$el.attr("draggable","true");
    this.$el.attr("ondragstart","dragStart(event)");
    let id = this.model.get("heading").split(" ").join("-");
    this.$el.attr("id",id);

    this.$el.html(this.itemTemplate(this.model.toJSON()));

    let currStatus = this.model.get("status");
    let taskStatusText = this.$el.find(".task-status");
    let colorCode;
    switch ( currStatus ) {
      case "todo": colorCode = "#ff4d4d"; break;
      case "progress": colorCode = "#e6ac00"; break;
      case "review": colorCode = "#4d88ff"; break;
      case "done": colorCode = "#00b300"; break;
    }
    taskStatusText.css("color",colorCode);

    return this;
  },
  destroyItem: function () {
    this.model.destroy();
    updatePluses();
  },
  moved: function (elem, statusString) {
    this.model.updateStatus(statusString);
  },
  editModel: function (ev) {
    $(ev.target).css("display","none");
    let inputField = $(ev.target).next();
    inputField.css("display","inline-block");
    inputField.focus();
  },
  changeModel: function (ev) {
    let inputField = $(ev.target);
    let textValue = inputField.val().trim();

    if(textValue) {
      let editField = inputField.attr("data-edit-field");
      this.model.save({ [editField]: textValue });
    }
    inputField.css("display","none");
    inputField.prev().css("display","block");
  },
  changeModelOnEnter: function (ev) {
    if( ev.which === 13 ) {
      this.changeModel(ev);
    }
  }
});

app.MainView = Backbone.View.extend({
  el: '#main-container',
  initialize: function () {
    app.todoList.on("add", this.addAll, this);
    app.todoList.on("reset", this.addAll, this);
    app.todoList.fetch();
  },
  events: {
    'keypress #new-author': 'addNewTodoOnEnter',
    'click #click-todo': 'addNewTodo'
  },
  addNewTodoOnEnter: function (e) {
    if( e.which !== 13 ) {
      return;
    }
    this.addNewTodo();
  },
  addNewTodo: function () {
    app.todoList.create(this.newTodo());
    $("#new-heading").val('');
    $("#new-task").val('');
    $("#new-author").val('');
  },
  addTodo: function (item) {
    let itemView = new app.ItemView({model: item});
    $("#todo-collection").append(itemView.render().el);
  },
  addProgress: function (item) {
    let itemView = new app.ItemView({model: item});
    $("#progress-collection").append(itemView.render().el);
  },
  addReview: function (item) {
    let itemView = new app.ItemView({model: item});
    $("#review-collection").append(itemView.render().el);
  },
  addDone: function (item) {
    let itemView = new app.ItemView({model: item});
    $("#done-collection").append(itemView.render().el);
  },
  addAll: function () {
    for( let id in app.collArray ) {
      $(app.collArray[id]).children(".collection-item").remove();
    }
    _.each(app.todoList.returnList("todo"), this.addTodo);
    _.each(app.todoList.returnList("progress"), this.addProgress);
    _.each(app.todoList.returnList("review"), this.addReview);
    _.each(app.todoList.returnList("done"), this.addDone);
  },
  newTodo: function () {
    return {
      heading: $("#new-heading").val().trim(),
      content: $("#new-task").val().trim(),
      author: $("#new-author").val().trim()
    };
  }
});

var todoView = new app.MainView();


// Drag and Drop UI

function dragStart(ev) {
  ev.dataTransfer.setData("text/plain", ev.target.id);
}

function onDragOver(ev) {
  ev.preventDefault();
  ev.dataTransfer.dropEffect = "move"
}

function onDrop(ev) {
  ev.preventDefault();
  let id = ev.dataTransfer.getData("text");

  for( let i in app.collArray ) {
    if( $(ev.target).parents(app.collArray[i]).length > 0 ) {

      let collToAdd = $(app.collArray[i]);
      collToAdd.append($("#"+id));

      _.each( app.todoList.models, function(elem) {
        if( elem.get("heading").split(" ").join("-") === id ) {
          let pattern = /#([a-z]*)-/;
          elem.trigger("movedEvent", elem, pattern.exec(app.collArray[i])[1]);
        }
      });
    }
  }
  updatePluses();
}

function updatePluses() {
  let cName = ".collection-item";

  for( let i = 1; i < app.collArray.length; i++ ) {
    let collToAdd = $(app.collArray[i]);

    if( collToAdd.children(cName).length > 0 ) {
      collToAdd.children(".add-to-icon").css("display","none");
    } else {
      collToAdd.children(".add-to-icon").css("display","initial");
    }
  }
}
