/* script file for index.html */

var app = {};

$(document).ready(updatePluses);

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
  statusTodo: function () {
    return this.filter( function(todomodel) {
      return (todomodel.get("status")==="todo");
    });
  },
  statusProgress: function () {
    return this.filter( function(todomodel) {
      return (todomodel.get("status")==="progress");
    });
  },
  statusReview: function () {
    return this.filter( function(todomodel) {
      return (todomodel.get("status")==="review");
    });
  },
  statusDone: function () {
    return this.filter( function(todomodel) {
      return (todomodel.get("status")==="done");
    });
  }
});

app.todoList = new app.TodoCollection();

app.ItemView = Backbone.View.extend({
  tagName: 'li',
  itemTemplate: _.template($("#childTemplate").html()),
  initialize: function () {
    this.model.on('movedEvent', this.moved, this);
    this.model.on('destroy', this.remove, this);
  },
  events: {
    'click .close-button': 'destroyItem'
  },
  render: function () {
    this.$el.addClass("collection-item");
    this.$el.attr("draggable","true");
    this.$el.attr("ondragstart","dragStart(event)");
    let id = this.model.get("heading").split(" ").join("-");
    this.$el.attr("id",id);
    this.$el.html(this.itemTemplate(this.model.toJSON()));
    return this;
  },
  destroyItem: function () {
    this.model.destroy();
    updatePluses();
  },
  moved: function (elem, statusString) {
    console.log(arguments[1]);
    this.model.updateStatus(statusString);
  }
});

app.MainView = Backbone.View.extend({
  el: '#main-container',
  initialize: function () {
    app.todoList.on("add", this.addAll, this);            //changeme
    app.todoList.on("reset", this.addAll, this);
    app.todoList.fetch();
  },
  events: {
    'keypress #new-author': 'addNewTodoOnEnter',
    'click #click-todo': 'addNewTodoOnClick'
  },
  addNewTodoOnEnter: function (e) {
    if( e.which !== 13 ) {
      return;
    }
    app.todoList.create(this.newTodo());
    $("#new-heading").val('');
    $("#new-task").val('');
    $("#new-author").val('');
  },
  addNewTodoOnClick: function () {
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
    $("#todo-collection").children(".collection-item").remove();
    $("#progress-collection").children(".collection-item").remove();
    $("#review-collection").children(".collection-item").remove();
    $("#done-collection").children(".collection-item").remove();
    _.each(app.todoList.statusTodo(), this.addTodo);
    _.each(app.todoList.statusProgress(), this.addProgress);
    _.each(app.todoList.statusReview(), this.addReview);
    _.each(app.todoList.statusDone(), this.addDone);
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

  let pColl = $("#progress-collection");
  let rColl = $("#review-collection");
  let dColl = $("#done-collection");
  let tColl = $("#todo-collection");

  //console.log($(ev.target).parents("#progress-collection"));

  if( $(ev.target).parents("#progress-collection").length > 0 ) {
    pColl.append($("#"+id));
    _.each( app.todoList.models, function(elem) {
      if( elem.get("heading").split(" ").join("-") === id ) {
        elem.trigger("movedEvent", elem, "progress");
      }
    });
  } else if( $(ev.target).parents("#review-collection").length > 0 ) {
    rColl.append($("#"+id));
    _.each( app.todoList.models, function(elem) {
      if( elem.get("heading").split(" ").join("-") === id ) {
        elem.trigger("movedEvent", elem, "review");
      }
    });
  } else if( $(ev.target).parents("#done-collection").length > 0 ) {
    dColl.append($("#"+id));
    _.each( app.todoList.models, function(elem) {
      if( elem.get("heading").split(" ").join("-") === id ) {
        elem.trigger("movedEvent", elem, "done");
      }
    });
  } else if( $(ev.target).parents("#todo-collection").length > 0 ) {
    tColl.append($("#"+id));
    _.each( app.todoList.models, function(elem) {
      if( elem.get("heading").split(" ").join("-") === id ) {
        elem.trigger("movedEvent", elem, "todo");
      }
    });
  }
  updatePluses();
}

function updatePluses() {
  let pColl = $("#progress-collection");
  let rColl = $("#review-collection");
  let dColl = $("#done-collection");
  let cName = ".collection-item";

  if( pColl.children(cName).length > 0 ) { pColl.children(".add-to-icon").css("display","none"); }
  else{ pColl.children(".add-to-icon").css("display","initial"); }
  if( rColl.children(cName).length > 0 ) { rColl.children(".add-to-icon").css("display","none"); }
  else{ rColl.children(".add-to-icon").css("display","initial"); }
  if( dColl.children(cName).length > 0 ) { dColl.children(".add-to-icon").css("display","none"); }
  else{ dColl.children(".add-to-icon").css("display","initial"); }
}
