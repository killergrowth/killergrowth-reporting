/**
 *  @access touchspin()
 */


new touchSpin({
    ele: '.basic-touch'
});

new touchSpin({
    ele: '.init-value',
    initval: 40,
});

new touchSpin({
    ele: '.touch-min',
    initval: 5,
    min: 5,
});

new touchSpin({
    ele: '.touch-max',
    initval: 10,
    max: 10,
});

new touchSpin({
    ele: '.touch-min-max',
    min: -5,
    max: 10,
});