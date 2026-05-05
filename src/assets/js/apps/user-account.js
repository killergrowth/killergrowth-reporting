/**
 * ==================
 * Single File Upload
 * ==================
*/

// We register the plugins required to do 
// image previews, cropping, resizing, etc.
FilePond.registerPlugin(
    FilePondPluginFileValidateType,
    FilePondPluginImageExifOrientation,
    FilePondPluginImagePreview,
    FilePondPluginImageCrop,
    FilePondPluginImageResize,
    FilePondPluginImageTransform,
  //   FilePondPluginImageEdit
  );
  
  // Select the file input and use 
  // create() to turn it into a pond
  let profilepic = FilePond.create(
    document.querySelector('.profile-image'),
    {
      imagePreviewHeight: 170,
      imageCropAspectRatio: '1:1',
      imageResizeTargetWidth: 200,
      imageResizeTargetHeight: 200,
      stylePanelLayout: 'compact circle',
      styleLoadIndicatorPosition: 'center bottom',
      styleProgressIndicatorPosition: 'right bottom',
      styleButtonRemoveItemPosition: 'left bottom',
      styleButtonProcessItemPosition: 'right bottom',
    }
);



/**
 * ==================
 * Multiple File Upload
 * ==================
*/


// We want to preview images, so we register
// the Image Preview plugin, We also register 
// exif orientation (to correct mobile image
// orientation) and size validation, to prevent
// large files from being added
FilePond.registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginImageExifOrientation,
  FilePondPluginFileValidateSize,
  // FilePondPluginImageEdit
);

// Select the file input and use 
// create() to turn it into a pond
let profilecover = FilePond.create(
  // document.querySelector('.profile-cover')
  document.querySelector('.file-upload-multiple')
);


profilecover.addFiles('../src/assets/img/apps/users/abstract-1.jpg');





let formAction = document.querySelectorAll('.form-actions');

formAction.forEach(item => {

  if (item.classList.contains('form-action-password')) {
    let get_formPasswordToggle = item.querySelector('.form-password-toggle');
    let get_formPasswordToggle_show = item.querySelector('.form-password-toggle').querySelector('.toggle-show');
    let get_formPasswordToggle_hide = item.querySelector('.form-password-toggle').querySelector('.toggle-hide');
    let get_formPasswordInput = item.querySelector('input');

    get_formPasswordToggle.addEventListener('click', function() {
      let get_typeAttributeValue = get_formPasswordInput.getAttribute('type');

      if (get_typeAttributeValue === 'password') {
        get_formPasswordInput.setAttribute('type', 'text')
        get_formPasswordToggle_show.classList.add('active');
        get_formPasswordToggle_hide.classList.remove('active');
      } else {
        get_formPasswordInput.setAttribute('type', 'password')
        get_formPasswordToggle_show.classList.remove('active');
        get_formPasswordToggle_hide.classList.add('active');
      }
      
    })
    
  } else {
    console.log('sdfdsf')
  }
  
  
  
});




/**
 * ================================
 *   Subscription Plan Selection
 * ================================ 
 */

let subscriptionPriceInput = document.querySelectorAll('.ab-sub-price-input');

subscriptionPriceInput.forEach(item => {
  
  item.addEventListener('change', function() {
    let setSelectedSubscription = document.querySelector('.current-subscription');
    setSelectedSubscription.innerHTML = item.value;    
  })
  
})





