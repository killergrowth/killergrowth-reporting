// const _get_pmPayment_Method = new bootstrap.Collapse('#pmPaymentMethod', {
//     toggle: false
// })


let _getPmCheck =  document.querySelectorAll('[name="pm-pc-check"]');
let _getPmCheckContent = document.querySelector('.pmPaymentMethod-collapsable')

_getPmCheck.forEach(element => {
    
    element.addEventListener('change',  function() {
        // console.log(this.value)
        console.log(element.value)

        if (element.value === 'Credit_Debit') {
            // _get_pmPayment_Method.show()

            _getPmCheckContent.classList.add('show');
            
        } else {
            _getPmCheckContent.classList.remove('show');
            // _get_pmPayment_Method.hide()
        }
    })
});














