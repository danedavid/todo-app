/* script file for index.html */

var app = {};

// Model
app.TodoModel = Backbone.Model.extend({
  defaults: {
    heading: '',
    content: '',
    author: '',
    status: 'todo'
  }
});

// Collection
app.TodoCollection = Backbone.Collection.extend({
  model: app.TodoModel,
  localStorage: new Store("real-todo"),
  statusTodo: function () {
    return this.filter( function(todomodel) {
      return (todomodel.get("status")=="todo");
    })
  }
});

app.todoList = new app.TodoCollection();
app.progressList = new app.TodoCollection();
app.reviewList = new app.TodoCollection();
app.doneList = new app.TodoCollection();

app.ItemView = Backbone.View.extend({
  tagName: 'li',
  itemTemplate: _.template($("#childTemplate").html()),
  render: function () {
    this.$el.addClass("collection-item");
    this.$el.html(this.itemTemplate(this.model.toJSON()));
    return this;
  }
});

app.TodoView = Backbone.View.extend({
  el: '#input-todo',
  initialize: function () {
    app.todoList.on("add", this.addOne, this);
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
  addOne: function (item) {
    let itemView = new app.ItemView({model: item});
    $("#todo-list").append(itemView.render().el);
  },
  addAll: function () {
    $("#todo-list").html('');
    _.each(app.todoList.statusTodo(), this.addOne);
  },
  newTodo: function () {
    return {
      heading: $("#new-heading").val().trim(),
      content: $("#new-task").val().trim(),
      author: $("#new-author").val().trim()
    };
  }
});

var todoView = new app.TodoView();
