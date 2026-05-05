let html5Slider = document.getElementById('html5');
let input0 = document.getElementById('input-with-keypress-0');
let input1 = document.getElementById('input-with-keypress-1');
let inputs = [input0, input1];

noUiSlider.create(html5Slider, {
    start: [0, 200],
    connect: true,
    tooltips: false,
    range: {
        'min': 0,
        'max': 200,
    },
    pips: {
        mode: 'count',
        // values: [0, 200],
        values: 5,
        density: 4
    }
});

html5Slider.noUiSlider.on('update', function (values, handle) {
    inputs[handle].value = values[handle];
});

// Listen to keydown events on the input field.
inputs.forEach(function (input, handle) {

    input.addEventListener('change', function () {
        html5Slider.noUiSlider.setHandle(handle, this.value);
    });

    input.addEventListener('keydown', function (e) {

        let values = html5Slider.noUiSlider.get();
        let value = Number(values[handle]);

        // [[handle0_down, handle0_up], [handle1_down, handle1_up]]
        let steps = html5Slider.noUiSlider.steps();

        // [down, up]
        let step = steps[handle];

        let position;

        // 13 is enter,
        // 38 is key up,
        // 40 is key down.
        switch (e.which) {

            case 13:
                html5Slider.noUiSlider.setHandle(handle, this.value);
                break;

            case 38:

                // Get step to go increase slider value (up)
                position = step[1];

                // false = no step is set
                if (position === false) {
                    position = 1;
                }

                // null = edge of slider
                if (position !== null) {
                    html5Slider.noUiSlider.setHandle(handle, value + position);
                }

                break;

            case 40:

                position = step[0];

                if (position === false) {
                    position = 1;
                }

                if (position !== null) {
                    html5Slider.noUiSlider.setHandle(handle, value - position);
                }

                break;
        }
    });
});






let _get_filterToggle = document.querySelector('.btn-filters-toggle');
let _get_filterSidebar = document.querySelector('#filterWrapper');
let _get_fs_closeBtn = document.querySelector('.close-btn');
let _get_pageOverlay = document.querySelector('.page-overlay');

_get_filterToggle.addEventListener('click', function() {
    // _get_filterSidebar.classList.add('show');
    document.body.classList.add('shop-filter-sidebar-show');
})
_get_fs_closeBtn.addEventListener('click', function() {
    // _get_filterSidebar.classList.remove('show');
    document.body.classList.remove('shop-filter-sidebar-show');
})
_get_pageOverlay.addEventListener('click', function() {
    // _get_filterSidebar.classList.remove('show');
    document.body.classList.remove('shop-filter-sidebar-show');
})






































































