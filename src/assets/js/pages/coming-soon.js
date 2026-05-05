var getDate = new Date();
var getCurrentYear = getDate.getFullYear();
var addOneYear = getCurrentYear + 1;

// Set the date we're counting down to
var countDownDate = new Date(`Mar 5, ${addOneYear} 15:37:25`).getTime();



function timer() {
    // Get today's date and time
  var now = new Date().getTime();

  // Find the distance between now and the count down date
  var distance = countDownDate - now;

  // Time calculations for days, hours, minutes and seconds
  var _get_days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var _get_hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var _get_minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var _get_seconds = Math.floor((distance % (1000 * 60)) / 1000);



  let _days = _get_days > 9 ? _get_days : '0' + _get_days;
  let _hours = _get_hours > 9 ? _get_hours : '0' + _get_hours;
  let _minutes = _get_minutes > 9 ? _get_minutes : '0' + _get_minutes;
  let _seconds = _get_seconds > 9 ? _get_seconds : '0' + _get_seconds;

 
  // Display the result in the element with id="demo"

  $html = `<div class="cs-counts">
                <h4>${_days}</h4>
                <p>days</p>
            </div>

            <div class="seperator">
                <p>:</p>
            </div>

            <div class="cs-counts">
                <h4>${_hours}</h4>
                <p>hours</p>
            </div>

            <div class="seperator">
                <p>:</p>
            </div>

            <div class="cs-counts">
                <h4>${_minutes}</h4>
                <p>minutes</p>
            </div>

            <div class="seperator">
                <p>:</p>
            </div>

            <div class="cs-counts">
                <h4>${_seconds}</h4>
                <p>seconds</p>
            </div>`;
  
  
  document.getElementById("cs-timer").innerHTML = $html;

  // If the count down is finished, write some text
  if (distance < 0) {
    clearInterval(x);
    document.getElementById("cs-timer").innerHTML = "EXPIRED";
  }
}

timer()


// Update the count down every 1 second
var x = setInterval(timer, 1000);