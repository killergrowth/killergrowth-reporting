/**
 * @function touchSpin
 * 
 * @param {object} options
 * 
 * @Warning :- Try not to change anything
 * 
 */



const touchSpin = function(options) {


    let OPTIONS = {
        // _Base: options.base,
        _Element: options.ele,
        _Min: options.min,
        _Max: options.max,
        _InitValue: options.initval

    }
    

    let _ele = document.querySelector(OPTIONS._Element);
    

    /**
    * @function _Element
    * @param {  } options
    */

    this.Element = function() {
        
    }
    
    
    
    /**
    * @function Increment
    * @param {  } options
    */

    this.Initvalue = function(Value) {
        let _get_tsInput = _ele.querySelector('.ts-input')
        
        if (Value === undefined) {
            _get_tsInput.value = 0;
        } else {
            _get_tsInput.value = Value;
        }
    }
    
    
    /**
    * @function Increment
    * @param {  } options
    */

    this.Increment = function(Max) {
        let input_Increment = _ele.querySelectorAll('.ts-input-increment');

        input_Increment.forEach(ts_inc => {

            ts_inc.addEventListener('click', function() {
    
                let _get_touchSpin = this.closest('.touchspin');
                let _get_touchSpin_input = _get_touchSpin.querySelector('.ts-input');

                if (Max !== undefined) {
                    let _get_touchSpin_inputValue = _get_touchSpin_input.value;
                    let _ts_change = Number(_get_touchSpin_inputValue);
                    let _increaseCount = _ts_change+1;

                    if (_increaseCount <= Max) {
                        _get_touchSpin_input.value = _increaseCount;            
                    }
                    
                } else {
                    let _get_touchSpin_inputValue = _get_touchSpin_input.value;
                    let _ts_change = Number(_get_touchSpin_inputValue);
                    let _increaseCount = _ts_change+1;
                    _get_touchSpin_input.value = _increaseCount;   
                }
                
            })
        })
        
    }
    
    /**
     * @function Decrement
     * @param {  } options
    */
   
   this.Decrement = function(Min) {
        let input_Decrement = _ele.querySelectorAll('.ts-input-decrement');

        input_Decrement.forEach(ts_dec => {
            
            ts_dec.addEventListener('click', function() {
    
                let _get_touchSpin = this.closest('.touchspin');
                let _get_touchSpin_input = _get_touchSpin.querySelector('.ts-input');


                if (Min !== undefined) {
                    let _get_touchSpin_inputValue = _get_touchSpin_input.value;
                    let _ts_change = Number(_get_touchSpin_inputValue);
                    let _decreaseCount = _ts_change-1;
                
                    if (_decreaseCount >= Min) {
                        _get_touchSpin_input.value = _decreaseCount;
                    }
                    
                } else {
                    let _get_touchSpin_inputValue = _get_touchSpin_input.value;
                    let _ts_change = Number(_get_touchSpin_inputValue);
                    let _decreaseCount = _ts_change-1;
                    _get_touchSpin_input.value = _decreaseCount;     
                }
                
            })

        })
        
    }

    this.Initvalue(OPTIONS._InitValue);
    this.Increment(OPTIONS._Max);
    this.Decrement(OPTIONS._Min);

    
}