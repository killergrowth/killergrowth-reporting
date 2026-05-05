document.addEventListener('DOMContentLoaded', function () {    
    
    let stepperWizardDefault = document.querySelector('.checkout-form-stepper');
    let stepperDefault = new Stepper(stepperWizardDefault, {
        animation: true
    })

    let stepperPrevButtonDefault = stepperWizardDefault.querySelectorAll('.btn-prev');
    let _get_addressSelected = document.querySelector('.address-selected');
    let _get_deliveryAddressBtn = document.querySelectorAll('.btn-delivery-address');
    let _get_checkoutBtn = document.querySelector('.btn-checkout');
    let _get_completeOrderBtn = document.querySelector('.btn-complete-order');
    let _get_discountInput = document.querySelector('.os-discount');
    let _get_editAddress = document.querySelector('.btn-edit-address');
    let _get_editOrderSummary = document.querySelector('.btn-edit-order-summary');
    // let _set_CheckoutBtn_DISABLE = (document.body.classList.contains('has-product')) ? _get_checkoutBtn.disabled = "false" : _get_checkoutBtn.disabled = "true";
    let _set_CheckoutBtn_DISABLE = (!document.body.classList.contains('has-product')) ? _get_checkoutBtn.disabled = "true" : "" ;
    
    /**
     * 
     *  Checkout Form Stepper
     * 
     */

    stepperPrevButtonDefault.forEach(element => {
        element.addEventListener('click', function() {
            stepperDefault.previous();
        })
    });

    stepperWizardDefault.addEventListener('show.bs-stepper', function (event) {
        if (event.detail.from < event.detail.to) {
            stepperWizardDefault.querySelectorAll('.step')[event.detail.from].classList.add('crossed');
        } else {
            stepperWizardDefault.querySelectorAll('.step')[event.detail.to].classList.remove('crossed');
        }

        if (event.detail.to === 1) {
            _get_checkoutBtn.style.display = 'none';
            _get_discountInput.style.display = 'none';
        }
        
        if (event.detail.to < 1) {
            _get_checkoutBtn.style.display = 'block';
            _get_discountInput.style.display = 'block';
        }
        

        if (event.detail.to === 2) {
            _get_addressSelected.style.display = 'block';
            _get_completeOrderBtn.style.display = 'block';

            _get_editAddress.style.display = 'block';
            _get_editOrderSummary.style.display = 'block';
        }

        if (event.detail.to < 2) {
            _get_addressSelected.style.display = 'none';
            _get_completeOrderBtn.style.display = 'none';

            _get_editAddress.style.display = 'none';
            _get_editOrderSummary.style.display = 'none';
        }

        
    })


    _get_deliveryAddressBtn.forEach(element => {
        element.addEventListener('click', function() {
            stepperDefault.to(3);
        })
    });
    
    _get_checkoutBtn.addEventListener('click', function() {
        stepperDefault.to(2);
    })
    _get_editAddress.addEventListener('click', function() {
        stepperDefault.to(2);
    })
    _get_editOrderSummary.addEventListener('click', function() {
        stepperDefault.to(2);
        stepperDefault.to(1);
    })



    let _getPmCheck =  document.querySelectorAll('[name="ab-sub-payment"]');
    let _getPmCheckContent = document.querySelector('.pmPaymentMethod-collapsable')

    _getPmCheck.forEach(element => {
        
        element.addEventListener('change',  function() {
            if (element.value === 'Credit_Debit') {
                _getPmCheckContent.classList.add('show');                
            } else {
                _getPmCheckContent.classList.remove('show');
            }
        })
    });



    // TouchSpin
    new touchSpin({
        ele: '.touch-product-quantity-1',
        initval: 1,
        min: 1,
        max: 60,
    });
    new touchSpin({
        ele: '.touch-product-quantity-2',
        initval: 1,
        min: 1,
        max: 20,
    });
    new touchSpin({
        ele: '.touch-product-quantity-3',
        initval: 1,
        min: 1,
        max: 72,
    });
    new touchSpin({
        ele: '.touch-product-quantity-4',
        initval: 1,
        min: 1,
        max: 90,
    });
    new touchSpin({
        ele: '.touch-product-quantity-5',
        initval: 1,
        min: 1,
        max: 44,
    });

})