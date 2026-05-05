// Carousel

var main = new Splide( '#main-slider', {
    type       : 'fade',
    heightRatio: 0.5,
    pagination : false,
    arrows     : false,
    cover      : true,
    //   fixedWidth: 656,
    fixedHeight: 556,
} );

var thumbnails = new Splide( '#thumbnail-slider', {
    rewind          : true,
    fixedWidth      : 104,
    fixedHeight     : 58,
    isNavigation    : true,
    gap             : 10,
    focus           : 'center',
    pagination      : false,
    cover           : true,
    dragMinThreshold: {
        mouse: 4,
        touch: 10,
    },
    breakpoints : {
        640: {
        fixedWidth  : 66,
        fixedHeight : 38,
        },
    },
} );

main.sync( thumbnails );
main.mount();
thumbnails.mount();

// Color Swatch

var colors = ['#4361ee', '#009688', '#008eff', '#7d30cb', '#f8538d', '#e2a03f', '#1b2e4b']

document.querySelectorAll('.color-swatch input[name="flexRadioDefault"]').forEach((element, index, array) => {
    element.style.backgroundColor = colors[index] 
})


// LightBox

const lightbox = GLightbox();


// TouchSpin
new touchSpin({
    ele: '.touch-product-quantity',
    initval: 1,
    min: 1,
    max: 72,
});



