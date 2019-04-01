/*
***********FULLY WORKING BUDGET APP - COMPLETED!!!*********
*/

/*
Structuring Our Code with Modules
- important aspect of any application architecture
- keeps units of code both cleanly separated and organized
- encapsulates some daya into privacy and expose other data publicly
    -encapsulation means
*/

//To Create modules, use the Module Pattern -> use Closures and IIFE
/*
*****************************************
what is happening in the below method
*****************************************
The IIFE returns immediately and is gone but the publicTest function that is returned will always have access to the x variable the add function because a closure was created.
publicTest method is public because it was returned and can be used. But the x and add variables are private because they are inside the closure and only the publicTest method can access them. This works because of closures. 
*/
/*
var calcAdd = (function() { //module pattern returns an object containing all functions that we want to be public (functions that we wants the outside scope access to)
     
    var x = 23; //doesnt have access to outer scope; private variable
    
    var add = function(a) { //private add function
        return x + a;
    }
    return { //returning empty object with method
        publicTest: function(b) {
            return(add(b));
        }
    }
})();
*/

//BUDGET CONTROLLER - keeps track of all expenses/incomes and of the budget itself and the percentages so we need a good data structure.
var budgetController = (function() {
    
    //data model for expenses and incomes - function constructor
    var Expense = function (id, description, value) { //private function
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    //calculates precentage
    Expense.prototype.calcPercentage = function(totalIncome) {
        
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
        
        
    };
    
    //returns the percentage
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    
    var Income = function (id, description, value) { //private function
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function (type) {
        var sum = 0;
        
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

   
    // created global data structure
    var data = {
        allItems: { // object
            exp: [],
            inc: []
        },
        totals: { // object
            exp: 0,
            inc: 0
        },
        budget : 0,
        percentage : -1 //set to -1 means non existant; if there are no budget values
    };
    
    return { //all public methods
        addItem: function(type, des, val) {
            var newItem, ID;
            
            //example for array of IDs
            //[1 2 3 4 5], next ID = 6
            //[1 2 4 6 8], next ID = 9 - that array is once we start deleting expenses
            //so.... ID = last ID + 1
            
            //[1 2 3 4 5] last in array is 5 (position 4)
            //end of array = last counted item - 1 -> because arrays are zero-based....
            //so length of sample array is 5 - 1 = 4
            
            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1; //this will give the last ID from the allItems array
            } else {
                ID = 0;
            }
            
            
            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            }else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            // Push it into the data structure
            data.allItems[type].push(newItem);
            
            // Return the new element
            return newItem; //returned so the other module/function that will call this function can have access to the item that was created
        },
        
        deleteItem: function(type, id) {
            
            var ids, index;
            /* example
            id = 6
            data.allItems[type][id] - this would not work as there might have been IDs that have already been deleted but the actual index doesnt match
            -> ids = [1 2 4 6 8] and id of 6 has index of 3
            */
            // we need to create new array that has all the IDs  and then find the index of that input ID
            ids = data.allItems[type].map(function(current) { //map returns a brand new array
                return current.id;        
            });
            
            index = ids.indexOf(id); //returns the index number of the element of the array that we input
            
            if (index !== -1) { //checks if the index exists. Can be -1 if the index is not found in the array. ONLY remove if index exists in array 
                
                data.allItems[type].splice(index, 1); // splice is used to delete element in array
            }
            
        },
        
        calculateBudget: function() { //sum of all incomes and expenses and the percentage of income that was already spent
            
            // calculate total income & expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // calculate budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
            
        },
        
        calculatePercentages: function() {
            
            /*
            example:
            a=20
            b=10
            c=40
            income=100
            a=20/100=20%
            b=10/100=10%
            c=40/100=40%
            */
            
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);                          
            });
            
        },
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
               return cur.getPercentage(); 
            });
            return allPerc;
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        
        testing: function() {
            console.log(data);
        }
    };
    
    
    
})();


//UI CONTROLLER

var UIController = (function() {
    
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber =  function(num, type) {
            var numSplit, int, dec, type;
            /*
            + or - before number
            exactly 2 decimal points
            comma separating the thousands
            
            ex. 2310.4567 -> + 2,310.46
            ex. 2000 -> + 2,000.00
            */
            
            num = Math.abs(num);
            num = num.toFixed(2); //toFixed is a method of the number prototype. Puts 2 decimal places after the fixed number. It will also add decimals if there are none
            
            numSplit = num.split('.'); //stored in array
            
            int = numSplit[0];
            if (int.length > 3) {
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3)//substring method returns part of the string we want
            }
            
            dec = numSplit[1];
            
            //ternary operator - ? is then; : is else
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
            
    };
    
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++){
            callback(list[i], i);
        }  
    };
    
    return { //public function will be returned. it will have to be in the object that the IIFE will return. This will be so the controller module can access the object
        getInput: function() { //public function
            return {
                //select all and retrieve value. Return object with the properties
                type: document.querySelector(DOMStrings.inputType).value, //will be either inc or exp
                description: document.querySelector(DOMStrings.inputDescription). value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value) //parseFloat converts string into number
            }; 
        },
        
        addListItem: function (obj, type){ //obj is the same as creating function constructor
            
            var html, newHtml, element;
            
            // Create HTML string with placeholder text
            //replace the data with some placeholder because when we then receive our 'obj', we can replace the placeholder with the actual data. Use '%' so its easier to find the palceholder text and dont override something else
            
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }           
            
            
            // Replace the placeholder text with actual data (data received from Object). Use 'replace' method
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description); //not replace the placeholder in HTML again because its in the new HTML variable now. If we used the html.replace, it would override the %id% placeholder which we dont want
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        
        deleteListItem: function(selectorID) {
            
            //deleting the type-id from the DOM
       var el =  document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        
        clearFields: function() { //clears UI when button/enter key is pressed
            
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue); //CSS selecting - separating selectors with a comma
            
            fieldsArr = Array.prototype.slice.call(fields);// querySelectorAll returns a list and if we are to use to loop over using forEach; we need to convert list into an array using the array method slice()
            // we will trick the code by passing a list and returning as an array using slice() method. The slice method returns a copy of an array but it is found within the Array.protoype 
            // the call action is used because its a function
            
            
            //forEach method is used on arrays
            //pass callback function into the method and the callback function is applied to each element in the array
            //anonymous function can receive up to three arguments - current value, index number, and the entire array
            fieldsArr.forEach(function(current, index, array) { 
                current.value = ""; 
            });
            
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj) {
            
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            
            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },
        
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMStrings.expensesPercLabel); //returns a nodeList
            
            
            
            nodeListForEach(fields, function(current, index) {
               if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
               } else {
                   current.textContent = '---';
               }
                   
                
            });
            
        },
        
        displayMonth: function() {
            
            var now, year, month, months;
            now = new Date(); //date of today if nothing passed in
            
            months = ['January', 'February', 'March','April','May','June','July','August','September','October','November','December'];
            
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year; //months is zero-based so month 0 is january..etc
            
        },
        
        changedType: function () {
            
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ',' +
                DOMStrings.inputValue); //returns nodeList
            
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
            
        },
                
        getDOMStrings: function() { //public function
            return DOMStrings; //this makes DOMStrings public to all other modules can access this
        }
    }
    
})();



//GLOBAL CONTROLLER
//modules can also receive arguments. We will be passing both UIcontroller and budgetcontroller as arguments so this controller knows of them and can connect to them
var controller = (function(budgetCtrl, UICtrl) { 
    
    //function where all event listeners will be placed
    var setupEventListeners = function() {
        var DOM = UICtrl.getDOMStrings(); //for DOMStrings in UI Controller
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        //adding event listener for button (key press)
        document.addEventListener('keypress', function(event) {
        
            if (event.keyCode === 13 || event.which === 13) { //event.which is for older browsers that might not have keycode as a property
                ctrlAddItem();   
            }
        }); 
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem); //new event listener for deleting item
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    var updateBudget = function() {
        
        // 1. Calculate budget
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget - when returning something, it must be in a variable
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on the UI 
        UICtrl.displayBudget(budget);
        
    };
    
    var updatePercentages = function() {
        
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update UI with new percentages
        UICtrl.displayPercentages(percentages);
    };
    
    //function that is called when to add a new item either from button click or 'enter' key
    var ctrlAddItem = function() {
        
        var input, newItem;
        
        //1. Get the filled input data
        input = UICtrl.getInput();
        
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //2. Add item to buget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
            //3.Add item to UI
            UICtrl.addListItem(newItem, input.type);
        
            //4. Clear the fields
            UICtrl.clearFields();
        
            // 5. Calculate and udate budget
            updateBudget();
            
            // 6. Calculate and Update percentages
            updatePercentages();
        }
        
    };
    
    var ctrlDeleteItem = function(event) {
       
       var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            
            // inc-1
            splitID = itemID.split('-'); //splits string depending and removing the split string within the () and placing all elements inside an array
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
            // 2. Delete the item from UI
            UICtrl.deleteListItem(itemID);
            
            // 3. Update and show the new budget
            updateBudget();
            
            // 4. Calculate and Update percentages
            updatePercentages();
            
        }
    };
    
    return {
        init: function() { //this fucntion will make all functions public beacuse returning an object in an IIFE makes all methods public to the other modules
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners(); //event listeners are only going to setup as soon as the init function is called.
        } 
    };
    
})(budgetController, UIController); //when controller is called, pass the arguments into function

controller.init(); //without this, nothing would happen becuase there would be any event listeners (needed to inp[ut data)





























