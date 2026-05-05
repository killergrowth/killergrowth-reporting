document.querySelector('.action-print').addEventListener('click', function(event) {
  event.preventDefault();
  /* Act on the event */
  window.print();
});


var currentDate = new Date();


var f1 = flatpickr(document.querySelector('.date-create'), {
  defaultDate: currentDate,
});

var f2 = flatpickr(document.querySelector('.date-due'), {
  defaultDate: currentDate.setDate(currentDate.getDate() + 5),
});



// Define the options
var options = {
  valueNames: [
    'id',
    'icTitle',
    'icDescription',
    'icService',
    'icQuantity',
    'icPrice',
    'icTotal'
  ]
};

// Init list
var contactList = new List('contacts', options);

// Select elements
var idField = document.getElementById('id-field'),
    
    titleField = document.getElementById('title-field'),
    descriptionField = document.getElementById('description-field'),
    serviceField = document.getElementById('service-field'),
    quantityField = document.getElementById('quantity-field'),
    priceField = document.getElementById('price-field'),
    // totalField = document.getElementById('total-field'),
    
    
    addBtn = document.getElementById('add-btn'),
    editBtn = document.getElementById('edit-btn'),
    removeBtns = document.querySelectorAll('.remove-item-btn'),
    editBtns = document.querySelectorAll('.edit-item-btn');

// Initially hide the edit button
editBtn.style.display = 'none';

// Sets callbacks to the buttons in the list
refreshCallbacks();

// Add button event listener
addBtn.addEventListener('click', function() {

  console.log(priceField.value*quantityField.value)

  // var arr = ['primary','success','dark', 'danger', 'info', 'warning'];
  // var idx = Math.floor(Math.random() * arr.length);

  
  contactList.add({
    id: Math.floor(Math.random() * 110000),
    icTitle: titleField.value,
    icDescription: descriptionField.value,
    // icService: `<span class="badge badge-light-${arr[idx]}">${serviceField.value}</span>`,
    icService: serviceField.value,
    icQuantity: quantityField.value,
    icPrice: priceField.value,
    icTotal: priceField.value*quantityField.value
  });
  clearFields();
  refreshCallbacks();
});

// Edit button event listener
editBtn.addEventListener('click', function() {
  // var item = contactList.find(function(item) {
  //   return item.id === idField.value;
  // });

  var item = contactList.get('id', idField.value)[0];
  
  item.values({
    id: idField.value,
    icTitle: titleField.value,
    icDescription: descriptionField.value,
    icService: serviceField.value,
    icQuantity: quantityField.value,
    icPrice: priceField.value,
    icTotal: priceField.value*quantityField.value
  });
  clearFields();
  editBtn.style.display = 'none';
  addBtn.style.display = 'inline-block';
});

// Function to refresh event callbacks for the buttons
function refreshCallbacks() {
  // Re-select new buttons
  removeBtns = document.querySelectorAll('.remove-item-btn');
  editBtns = document.querySelectorAll('.edit-item-btn');

  removeBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var itemId = this.closest('tr').querySelector('.id').textContent;
      contactList.remove('id', itemId);
    });
  });

  editBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var itemId = this.closest('tr').querySelector('.id').textContent;
      // var itemValues = contactList.find(function(item) {
      //   return item.id === itemId;
      // }).values();

      var item = contactList.get('id', itemId)[0];  // Get the first item matching the id
      var itemValues = item.values();  // Get the values of the item

      idField.value = itemValues.id;
      titleField.value = itemValues.icTitle;
      descriptionField.value = itemValues.icDescription;
      serviceField.value = itemValues.icService;
      quantityField.value = itemValues.icQuantity;
      priceField.value = itemValues.icPrice;
      // totalField.value = itemValues.icTotal;


    //   icTitle: titleField.value,
    // icDescription: descriptionField.value,
    // icService: serviceField.value,
    // icQuantity: quantityField.value,
    // icPrice: priceField.value,
    // icTotal: totalField.value
      
      

      editBtn.style.display = 'inline-block';
      addBtn.style.display = 'none';
    });
  });
}

// Function to clear input fields
function clearFields() {
  titleField.value = '';
  descriptionField.value = '';
  serviceField.value = '';
  quantityField.value = '';
  priceField.value = '';
  // totalField.value = '';
}




let get_addItem = document.querySelector('.add-item');
let get_addEditForm = document.querySelector('.add-edit-form');

get_addItem.addEventListener('click', function() {
  if (get_addEditForm.classList.contains('d-none')) {
    get_addEditForm.classList.remove('d-none');
    get_addEditForm.classList.add('d-block');
  } else {
    get_addEditForm.classList.remove('d-block');
    get_addEditForm.classList.add('d-none');
  }
})

















































































