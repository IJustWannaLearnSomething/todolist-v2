//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
//iH1uVpHWIWCBqnm0
//admin-sanskar
mongoose.connect("mongodb+srv://admin-sanskar:iH1uVpHWIWCBqnm0@cluster0.epaeljf.mongodb.net/todolistDB");

const listItemSchema = new Schema({
  item: String
});

const listSchema = new Schema({
  name: String,
  items: [listItemSchema]
});

const ListItem = mongoose.model("ListItem", listItemSchema);

const List = mongoose.model("List", listSchema);


const item1 = new ListItem({
  item: "Welcome!"
});
const item2 = new ListItem({
  item: "Add items with +"
});
const item3 = new ListItem({
  item: "<-- Click to remove!"
});

const defaultItems = [item1, item2, item3];

app.get('/favicon.ico', (req, res) => res.status(204));

app.get("/", function(req, res) {
  ListItem.find((err, results) => {
    if(!err) {
      if(results.length === 0 || !results) {
        ListItem.insertMany(defaultItems, (err) => {
          if(!err){
            console.log("EMPTY DB SUCESSFULLY UPDATED WITH DEFAULT ITEMS ARRAY!");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", {listTitle: "Today", newListItems: results});
      }
    }
  });
});

app.get("/:newList", (req, res) => {
  const customListName = _.capitalize(req.params.newList);
  List.findOne({name: customListName}, (err, result) => {
    if(!err){
      if(result.items === 0 || !result){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {listTitle: result.name, newListItems: result.items});
      }
    }
  });
})

app.post("/", function(req, res){
  const inputItem = new ListItem({
    item: req.body.newItem
  });
  const listName = req.body.list;

  switch(inputItem.item) {
    case '':
    case null:
    case undefined:
      res.redirect("/");
      break;
    default:
      if(listName === "Today") {
        inputItem.save();
        res.redirect("/");
      } else {
        List.findOne({name: listName}, (err,result) => {
          result.items.push(inputItem);
          result.save();
          res.redirect("/" + listName);
        });
      }
      break;
  }
});

app.post("/delete", function(req, res){
  const itemToDeleteId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today") {
    ListItem.findByIdAndDelete(itemToDeleteId, (err) => {
      if(!err) {
        console.log("ENTRY DELETED SUCCESFULLY!");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemToDeleteId}}}, (err,result) => {
      if(!err) {
        res.redirect("/" + listName);
      }
    });
  }
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
