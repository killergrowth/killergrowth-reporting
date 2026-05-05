// var currentDate = new Date();

// /**
//  * ==================
//  * Single File Upload
//  * ==================
// */

// // We register the plugins required to do 
// // image previews, cropping, resizing, etc.
// FilePond.registerPlugin(
//   FilePondPluginFileValidateType,
//   FilePondPluginImageExifOrientation,
//   FilePondPluginImagePreview,
//   FilePondPluginImageCrop,
//   FilePondPluginImageResize,
//   FilePondPluginImageTransform,
// //   FilePondPluginImageEdit
// );

// // Select the file input and use 
// // create() to turn it into a pond
// FilePond.create(
//   document.querySelector('.filepond'),
//   {
//     // labelIdle: `<span class="no-image-placeholder"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></span> <p class="drag-para">Drag & Drop your picture or <span class="filepond--label-action" tabindex="0">Browse</span></p>`,
//     imagePreviewHeight: 80,
//     imageCropAspectRatio: '1:1',
//     imageResizeTargetWidth: 80,
//     imageResizeTargetHeight: 80,
//     stylePanelLayout: 'compact circle',
//     styleLoadIndicatorPosition: 'center bottom',
//     styleProgressIndicatorPosition: 'right bottom',
//     styleButtonRemoveItemPosition: 'left bottom',
//     styleButtonProcessItemPosition: 'right bottom',
//   }
// );

// var f1 = flatpickr(document.getElementById('date'), {
//   defaultDate: currentDate,
// });

// var f2 = flatpickr(document.getElementById('due'), {
//   defaultDate: currentDate.setDate(currentDate.getDate() + 5),
// });

// function deleteItemRow() {
//     deleteItem = document.querySelectorAll('.delete-item');
//     for (var i = 0; i < deleteItem.length; i++) {
//         deleteItem[i].addEventListener('click', function() {
//             this.parentElement.parentNode.parentNode.parentNode.remove();
//         })
//     }
// }

// function selectableDropdown(getElement, myCallback) {
//   var getDropdownElement = getElement;
//   for (var i = 0; i < getDropdownElement.length; i++) {
//       getDropdownElement[i].addEventListener('click', function() {

//         var dataValue = this.getAttribute('data-value');
//         var dataImage = this.getAttribute('data-img-value');

//         if(dataValue === null && dataImage === null) {
//           console.warn('No attributes are defined. Kindly define one attribute atleast')
//         }
        
//         if (dataValue != '' && dataValue != null) {
//           this.parentElement.parentNode.querySelector('.dropdown-toggle > .selectable-text').innerText = dataValue;
//         }

//         if (dataImage != '' && dataImage != null) {
//           this.parentElement.parentNode.querySelector('.dropdown-toggle > img').setAttribute('src', dataImage );
//         }

//       })
//   }
// }

// function getTaxValue(value) {
//     if (value.dropdownValue == 'Deducted') {
//         console.log('I am percentage')
//         document.querySelector('.tax-rate-deducted').style.display = 'block';
//         document.querySelector('.tax-rate-per-item').style.display = 'none';
//         document.querySelector('.tax-rate-on-total').style.display = 'none';
//     } else if (value.dropdownValue == 'Per Item') {
//         console.log('I am Flat Amount')
//         document.querySelector('.tax-rate-deducted').style.display = 'none';
//         document.querySelector('.tax-rate-per-item').style.display = 'block';
//         document.querySelector('.tax-rate-on-total').style.display = 'none';
//     } else if (value.dropdownValue == 'On Total') {
//         console.log('I am Flat Amount')
//         document.querySelector('.tax-rate-deducted').style.display = 'none';
//         document.querySelector('.tax-rate-per-item').style.display = 'none';
//         document.querySelector('.tax-rate-on-total').style.display = 'block';
//     } else if (value.dropdownValue == 'None') {
//         console.log('I am None')
//         document.querySelector('.tax-rate-deducted').style.display = 'none';
//         document.querySelector('.tax-rate-per-item').style.display = 'none';
//         document.querySelector('.tax-rate-on-total').style.display = 'none';
//     }
// }

// function getDiscountValue(value) {
//     if (value.dropdownValue == 'Percent') {
//         console.log('I am percentage')
//         document.querySelector('.discount-percent').style.display = 'block';
//         document.querySelector('.discount-amount').style.display = 'none';
//     } else if (value.dropdownValue == 'Flat Amount') {
//         console.log('I am Flat Amount')
//         document.querySelector('.discount-amount').style.display = 'block';
//         document.querySelector('.discount-percent').style.display = 'none';
//     } else if (value.dropdownValue == 'None') {
//         console.log('I am None')
//         document.querySelector('.discount-percent').style.display = 'none';
//         document.querySelector('.discount-amount').style.display = 'none';
//     }
// }

// document.getElementsByClassName('additem')[0].addEventListener('click', function() {
//   console.log('dfdf')

//   getTableElement = document.querySelector('.item-table');
//   currentIndex = getTableElement.rows.length;

//   $html = '<tr>'+
//   '<td class="delete-item-row">'+
//       '<ul class="table-controls">'+
//           '<li><a href="javascript:void(0);" class="delete-item" data-toggle="tooltip" data-placement="top" title="" data-original-title="Delete"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-x-circle"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg></a></li>'+
//       '</ul>'+
//     '</td>'+
//     '<td class="description"><input type="text" class="form-control  form-control-sm" placeholder="Item Description"> <textarea class="form-control" placeholder="Additional Details"></textarea></td>'+
//     '<td class="rate">'+
//         '<input type="text" class="form-control  form-control-sm" placeholder="Price">'+
//    ' </td>'+
//     '<td class="text-right qty"><input type="text" class="form-control  form-control-sm" placeholder="Quantity"></td>'+
//     '<td class="text-right amount"><span class="editable-amount"><span class="currency">$</span> <span class="amount">0.00</span></td>'+
//     '<td class="text-center tax">'+
//         '<div class="n-chk">'+
//             '<div class="form-check form-check-primary form-check-inline me-0 mb-0">'+
//                 '<input class="form-check-input inbox-chkbox contact-chkbox" type="checkbox">'+
//             '</div>'+
//         '</div>'+
//     '</td>'+
//     '</tr>';

//   $(".item-table tbody").append($html);
//   deleteItemRow();

// })

// deleteItemRow();
// selectableDropdown(document.querySelectorAll('.invoice-select .dropdown-item'));
// selectableDropdown(document.querySelectorAll('.invoice-tax-select .dropdown-item'), getTaxValue);
// selectableDropdown(document.querySelectorAll('.invoice-discount-select .dropdown-item'), getDiscountValue);









































// var options = {
//   valueNames: [ 'id', 'name', 'age', 'city' ]
// };

// // Init list
// var contactList = new List('contacts', options);

// var idField = document.querySelector('#id-field'),
//     nameField = document.querySelector('#name-field'),
//     ageField = document.querySelector('#age-field'),
//     cityField = document.querySelector('#city-field'),
//     addBtn = document.querySelector('#add-btn'),
//     // editBtn = document.querySelector('#edit-btn').hide(),
//     editBtn = document.querySelector('#edit-btn'),
//     removeBtns = document.querySelector('.remove-item-btn'),
//     editBtns = document.querySelector('.edit-item-btn');

// // Sets callbacks to the buttons in the list
// refreshCallbacks();

// // addBtn.click(function() {
// //   contactList.add({
// //     id: Math.floor(Math.random()*110000),
// //     name: nameField.val(),
// //     age: ageField.val(),
// //     city: cityField.val()
// //   });
// //   clearFields();
// //   refreshCallbacks();
// // });


// addBtn.addEventListener('click', function() {
//   contactList.add({
//     id: Math.floor(Math.random()*110000),
//     name: nameField.value,
//     age: ageField.value,
//     city: cityField.value
//   });

//   clearFields();
//   // refreshCallbacks();
// });






// editBtn.addEventListener('click', function() {
//   var item = contactList.find(function(item) {
//     return item.id === idField.value;
//   });
//   // console.log(item);
//   // console.log(contactList)
//   //     console.log(item.id)
//   //     console.log(item.value)
//   //     console.log(contactList.find())
  
//   item.values({
//     id: idField.value,
//     name: nameField.value,
//     age: ageField.value,
//     city: cityField.value
//   });

//   clearFields();
//   // editBtn.hide();
//   // addBtn.show();

//   editBtn.style.display = 'none';
//   addBtn.style.display = 'block';
// });



// function refreshCallbacks() {
//   // Needed to reselect the new buttons

//   // console.log(removeBtns)
  
//   removeBtns = document.querySelectorAll('.remove-item-btn');
//   editBtns = document.querySelectorAll('.edit-item-btn');

//   removeBtns.forEach(function(btn) {
//     btn.addEventListener('click', function() {
//       var itemId = this.closest('tr').querySelector('.id').textContent;
//       contactList.remove('id', itemId);
//     });
//   });

//   editBtns.forEach(function(btn) {
//     btn.addEventListener('click', function() {
//       var itemId = this.closest('tr').querySelector('.id').textContent;
      
//       // var item = contactList

//       console.log(contactList)
//       console.log(item.id)
//       console.log(itemId.value)
//       // console.log(contactList.find())
      
//       var itemValues = contactList.find(function(item) {
//         return item.id === itemId.value;
//       });

//       // var item = contactList.find(function(item) {
//       //   return item.id === idField.value;
//       // });
      
//       idField.value = itemValues.id;
//       nameField.value = itemValues.name;
//       ageField.value = itemValues.age;
//       cityField.value = itemValues.city;
      
//       editBtn.style.display = 'block';
//       addBtn.style.display = 'none';
//     });
//   });
// }




// function clearFields() {
//   // nameField.val('');
//   // ageField.val('');
//   // cityField.val('');

//   nameField.value = '';
//   ageField.value = '';
//   cityField.value = '';
// }













// // Define the options
// var options = {
//   valueNames: ['id', 'name', 'age', 'city']
// };

// // Init list
// var contactList = new List('contacts', options);

// // Select elements
// var idField = document.getElementById('id-field'),
//     nameField = document.getElementById('name-field'),
//     ageField = document.getElementById('age-field'),
//     cityField = document.getElementById('city-field'),
//     addBtn = document.getElementById('add-btn'),
//     editBtn = document.getElementById('edit-btn'),
//     removeBtns = document.querySelectorAll('.remove-item-btn'),
//     editBtns = document.querySelectorAll('.edit-item-btn');

// // Initially hide the edit button
// editBtn.style.display = 'none';

// // Sets callbacks to the buttons in the list
// refreshCallbacks();

// // Add button event listener
// addBtn.addEventListener('click', function() {
//   contactList.add({
//     id: Math.floor(Math.random() * 110000),
//     name: nameField.value,
//     age: ageField.value,
//     city: cityField.value
//   });
//   clearFields();
//   refreshCallbacks();
// });

// // Edit button event listener
// editBtn.addEventListener('click', function() {
//   // var item = contactList.find(function(item) {
//   //   return item.id === idField.value;
//   // });

//   var item = contactList.get('id', idField.value)[0];
  
//   item.values({
//     id: idField.value,
//     name: nameField.value,
//     age: ageField.value,
//     city: cityField.value
//   });
//   clearFields();
//   editBtn.style.display = 'none';
//   addBtn.style.display = 'inline-block';
// });

// // Function to refresh event callbacks for the buttons
// function refreshCallbacks() {
//   // Re-select new buttons
//   removeBtns = document.querySelectorAll('.remove-item-btn');
//   editBtns = document.querySelectorAll('.edit-item-btn');

//   removeBtns.forEach(function(btn) {
//     btn.addEventListener('click', function() {
//       var itemId = this.closest('tr').querySelector('.id').textContent;
//       contactList.remove('id', itemId);
//     });
//   });

//   editBtns.forEach(function(btn) {
//     btn.addEventListener('click', function() {
//       var itemId = this.closest('tr').querySelector('.id').textContent;
//       // var itemValues = contactList.find(function(item) {
//       //   return item.id === itemId;
//       // }).values();

//       var item = contactList.get('id', itemId)[0];  // Get the first item matching the id
//       var itemValues = item.values();  // Get the values of the item

//       idField.value = itemValues.id;
//       nameField.value = itemValues.name;
//       ageField.value = itemValues.age;
//       cityField.value = itemValues.city;

//       editBtn.style.display = 'inline-block';
//       addBtn.style.display = 'none';
//     });
//   });
// }

// // Function to clear input fields
// function clearFields() {
//   nameField.value = '';
//   ageField.value = '';
//   cityField.value = '';
// }







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

















































































