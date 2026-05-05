/**
 * 
 *  Testimonial Slider
 * 
 */

var splide = new Splide( '.testimonialWrapperSlider', {
    type   : 'loop',
    pagination : false
} );
splide.mount();


/**
 * 
 *  Team Wrapper Slider
 * 
 */

var teamWrapper = new Splide( '.team-wrapper-slider', {
    pagination : false,
    perPage: 4,
    gap: 40,
    focus  : 'center',
    breakpoints: {
        1199: {
            perPage: 3,
        },
        
        992: {
            perPage: 2,
        },
        575: {
            perPage: 1,
        },
    }
} );

teamWrapper.mount();