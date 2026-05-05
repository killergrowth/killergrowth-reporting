/**
 * ===================================
 *    Product Description Editor 
 * ===================================
*/
var quill = new Quill('#product-description', {
    modules: {
        toolbar: [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline'],
        ['image', 'code-block']
        ]
    },
    placeholder: 'Write product description...',
    theme: 'snow'  // or 'bubble'
});


/**
 * ====================
 *      File Pond 
 * ====================
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
var ecommerce = FilePond.create(document.querySelector('.file-upload-multiple'));





new TomSelect('#productColors', {
    maxItems: null,
    placeholder: 'Choose...',
    plugins: {
		remove_button:{
			title:'Remove this item',
		}
	}
});

new TomSelect('#productSize', {
    maxItems: null,
    placeholder: 'Choose...',
    plugins: {
		remove_button:{
			title:'Remove this item',
		}
	}
});

new TomSelect('#productGender', {
    maxItems: null,
    placeholder: 'Choose...',
    plugins: {
		remove_button:{
			title:'Remove this item',
		}
	}
});




