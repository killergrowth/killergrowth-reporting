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
      files: [
          {
            // the server file reference
            source: '../src/assets/img/profile/profile-26.png',
            // source: '',

            // set type to limbo to tell FilePond this is a temp file
            options: {
                type: 'image/png',
            },
          },
      ],
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