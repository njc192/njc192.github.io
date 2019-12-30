
const DB_VERSION = 1;
const DB_STORE_NAME = "storedItems"

var db;

var arr = [];
const myInput = document.querySelector(".myInput");
const submit = document.querySelector(".submit");
const grabBag = document.querySelector(".items");

function openDb()
{
  console.log("openDb...");
  var req = indexedDB.open(DB_STORE_NAME,DB_VERSION);
  req.onsuccess = function(e)
  {
    db = req.result;
    console.log(db)
    console.log("openDb DONE");
    updateList();
  };

  req.onerror = function(e)
  {
    console.error("openDb:", e.target.errorCode);
  };

  req.onupgradeneeded = function(e)
  {
    console.log("openDb.onupgradeneeded");
    var store = e.currentTarget.result.createObjectStore(DB_STORE_NAME, {keyPath: "name"});
    store.createIndex("url","url",{unique:true});
  }

}


function updateList()
{
  var transaction = db.transaction(DB_STORE_NAME);
  var objectStore = transaction.objectStore(DB_STORE_NAME);
  objectStore.openCursor().onsuccess = function(e)
  {
    var cursor = e.target.result;
    if(cursor)
    {
      var request = objectStore.get(cursor.key);
      request.onerror = function(e)
      {
        console.log("could not find key?");
      }
      request.onsuccess = function(e)
      {
        addToList(request.result.name,request.result.url,null);
      }
      cursor.continue();
    }
    else{
      console.log("no more entries?")
    }
  }
}

function autocomplete(inp) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      getJson(inp,a,b)
      /*for each item in the array...*/
   
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {

      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });

  async function getJson(inp,a,b)
  {
    if(!inp.value.endsWith(" "))
    {
      const url = "https://www.ifixit.com/api/2.0/suggest/" + inp.value + "?doctypes=device";
      const response = await fetch(url);
      const myJson = await response.json();
      arr = myJson["results"];
    }

       for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
         /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = arr[i]["display_title"]
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + arr[i]["display_title"] + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
          b.addEventListener("click", function(e) {
              /*insert the value for the autocomplete text field:*/
              inp.value = this.getElementsByTagName("input")[0].value;
              /*close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
              closeAllLists();
          });
          a.appendChild(b);
      }
  }
}


submit.addEventListener("click",function(event)
{
  event.preventDefault();
    if(myInput !== null)
    {
      var tempVal;
      for(let i =0 ; i < arr.length; i++)
      {
        tempVal = arr[i];
        if(myInput.value === tempVal["display_title"] )
        {
          if(firstInstance(tempVal["display_title"]))
          {
            addToList(tempVal["display_title"],tempVal["url"],tempVal)
          }

        }
      }
  }
});


function addToList(name,url,tempVal)
{
    var itemName = document.createElement("li"); 
    itemName.setAttribute("class","itemName");
    itemName.setAttribute("id",name);
    itemName.textContent = name;

    var listItem = document.createElement("li");
    listItem.setAttribute("class", "itemInfo")
    listItem.setAttribute("id",name);
    var info = document.createElement("a")
    info.setAttribute("class", "info");
    info.setAttribute("href",url);
    info.setAttribute("target","_blank");
    info.textContent = "info";

    var spacer = document.createElement("span");
    spacer.setAttribute("id",name);
    spacer.textContent = " | ";

    var remove = document.createElement("a");
    remove.setAttribute("id",name);
    remove.setAttribute("class","remove")
    remove.setAttribute("href","#");
    remove.setAttribute("title",name);
    remove.textContent = "remove";

    remove.addEventListener("click",function(e)
    {
      e.preventDefault();
      removeItem(remove.title);
    });


    listItem.appendChild(info);
    listItem.append(spacer);
    listItem.append(remove);

    grabBag.appendChild(itemName);
    grabBag.appendChild(listItem);
    if(tempVal !== null)
    {
      addItemToDb(tempVal);

    }
}

function addItemToDb(item)
{
  var obj = {name: item["display_title"], url: item["url"]};
  var transaction = db.transaction(DB_STORE_NAME,"readwrite");

  transaction.onsuccess = function(e)
  {
    console.log("successsss");
  }
  transaction.oncomplete = function(e)
  {
    console.log("completed");
  }

  transaction.onerror = function(e)
  {
    console.log("duplicate?");
  }
  
  var objectStore = transaction.objectStore(DB_STORE_NAME);
  var request = objectStore.add(obj);
  request.onsuccess = function(e)
  {
    console.log("hey dude i think we added something")
    console.log(e.target.result);
    console.log(e.target.result.url)
  }

}

function firstInstance(checkString)
{
  var child = grabBag.children;
  if(child == null)
    return true;
  if(child.length === 0)
    return true;
  for(let i = 0; i < grabBag.children.length; i++)
  {
    if(child[i].textContent === checkString)
    {
      console.log(child[i].textContent)
      console.log("this is a duplicate")
      return false;
    }
  }
  return true;
}


function removeItem(item)
{
  var val = document.getElementById(item);
  val.parentNode.removeChild(val);
  val = document.getElementById(item);
  val.parentNode.removeChild(val);

  var request = db.transaction(DB_STORE_NAME,"readwrite")
                .objectStore(DB_STORE_NAME)
                .delete(item);
  
  
}



/*initiate the autocomplete function on the "myInput" element, and pass along the countries array as possible autocomplete values:*/
openDb();

autocomplete(document.getElementById("myInput"));
