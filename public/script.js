document.addEventListener('DOMContentLoaded', function () {
  //Light mode as default
  let darkMode = false;

  // Check if dark mode has been set by user
  if (localStorage.getItem('darkMode') !== null) {
    darkMode = localStorage.getItem('darkMode') === 'true';
  } else {
    // Check if browser is in dark mode
    const browserPref =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (browserPref) {
      darkMode = true;
    } else {
      // Check if system is in dark mode
      const osPref =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      darkMode = osPref;
    }
  }

  // Add class to body based on dark mode setting
  const toggleDarkMode = () => {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);

    console.log(`User Pref: ${darkMode ? 'Light mode' : 'Dark mode'}`);
    console.log(
      `Browser Pref: ${
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'Dark mode'
          : 'Light mode'
      }`
    );
    console.log(
      `OS Pref: ${
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'Dark mode'
          : 'Light mode'
      }`
    );
  };

  // check if dark mode has been set
  // assign styling
  if (darkMode) {
    $('body')
      .removeClass('bg-[url(`./img/UVUHorizontalWhite-0011.png`)]')
      .addClass(
        `bg-[url('./img/UVUHorizontalGreen-0009.png')] bg-[#f2f9e9] text-white`
      );
    $('#form')
      .removeClass('bg-[#275D38]')
      .addClass(
        'bg-[#6f937a] bg-cover bg-top bg-[length:400px_150px] text-[#275d38]'
      );
  }
  // toggle mode button
  $('#btn-toggle').click(toggleDarkMode);
  $('#btn-toggle').text(!darkMode ? 'Light Mode' : 'Dark Mode');

  // Disable Add Log button until logs are displayed
  $('#addLog').prop('disabled', true).addClass('opacity-20');
  $('#logEntry').prop('disabled', true).addClass('opacity-20');

  // styling for ul log entry box and containers
  $('select').addClass('rounded');

  // Make UVU ID visible only after course selection has been made
  $('#uvuId, #uvuIdLbl, #uvuIdDisplay, #addLog, #logEntry, #logLbl').hide();
  $('#course').change(function () {
    if ($(this).val() !== '') {
      $('#uvuId').attr(
        'placeholder',
        'Enter a valid UVU ID        eg. 10234567'
      );
      $('#uvuId, #uvuIdLbl').show();
    } else {
      $(
        '#uvuId, #uvuIdLbl, #uvuIdDisplay, #addLog, #logEntry, #logLbl, #logs'
      ).hide();
    }
  });

  // Dynamically display data within form>select elements

  axios
    // call to populate select element
    .get(
      'https://jsonserverpazgcu-umxz--3000.local-credentialless.webcontainer.io/api/v1/courses'
    )
    .then((response) => {
      response.data.forEach((course) => {
        // Use jQuery to create a new <option> element
        const option = $('<option>');
        // set values and content to the appropriate course attributes
        option.val(course.id);
        console.log(option.val(course.id));
        option.text(course.display);
        $('#course').append(option);
      });
      $('#course').find('option:first-child').prop('selected', false);
    })
    .catch((error) => {
      console.error('Error fetching courses:', error);
    });

  /* UVU Id Validation */
  /* Ensure uvuId input checks input for strings no longer than 8 and returns error codes for violations*/

  $('input').on('input', function (event) {
    // Ensure character length never exceeds 8
    if (event.target.value.length > 8) {
      event.target.value = event.target.value.substring(0, 8);
    }
    // Only allow numbers, no letters or other characters
    if (!/^\d+$/.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^\d]/g, '');
    }

    // When character length reaches 8 and it's only digits, fire off an AJAX request
    if (event.target.value.length === 8) {
      // capture passed courseId and uvuId
      const courseId = $('#course').val();
      const uvuId = event.target.value;

      axios
        // call to populate log entries
        .get(
          `
          https://jsonserverpazgcu-umxz--3000.local-credentialless.webcontainer.io/api/v1/logs?coursId=${courseId}&uvuId=${uvuId}`
        )
        .then((response) => {
          if (response.status === 200 || response.status === 304) {
            return response.data;
          } else {
            throw new Error('Invalid UVU ID');
          }
        })
        .then((data) => {
          // check if object is empty
          if (Object.keys(data).length === 0) {
            throw new Error('Invalid UVU ID');
            // check if the courseId passed in input matches the courseID in response
            // ensures response data reflects only records where a course log has been made under
            // the appropriate uvuId
          } else if (data.find((obj) => obj.courseId === courseId)) {
            // Get the log entries container
            const logEntries = $('#logs');
            // Clear the container before appending new entries
            logEntries.empty();
            // Iterate over the log data
            data.forEach((log) => {
              // set h3 header
              // Update the innerHTML to show the chosen UVU ID
              $('#uvuIdDisplay').removeClass('d-none');
              $('#uvuIdDisplay').addClass('pt-8 text-white font-[RajdSemi]');
              $('#uvuIdDisplay').show();
              $('#addLog, #logEntry').show();
              $('#uvuIdDisplay').html(`Student Logs for ${log.uvuId}`);
              // Create a new list item
              const logItem = $(`<li>`);

              // Create the log date element
              const logDate = $(`<div><small>${log.date}</small></div>`);
              $('small').addClass('text-lg font-bold border-x-gray-300');

              // Create the log text element
              const logText = $(`<pre><p>${log.text}</p></pre>`);

              // Append the date and text elements to the list item
              logItem.append(logDate);
              logItem.append(logText);
              // Append the list item to the log entries container
              logEntries.append(logItem);
            });

            // add css classes to new elements
            $('.log-entries').addClass(
              'p-2 bg-gray-100 border-2 border-solid block'
            );
            $('.log-entries li').addClass(
              'rounded p-2 bg-gray-100 border-2 border-solid block'
            );
            $('div small').addClass(
              'rounded text-base font-medium border-[#6f937a]'
            );
            $('pre').addClass(
              'rounded font-sans border-solid border-inherit whitespace-pre-wrap'
            );

            // re-activate addLog button & textarea
            $('#addLog').prop('disabled', false).removeClass('opacity-20');
            $('#logEntry').prop('disabled', false).removeClass('opacity-20');
            // display only log dates with on click event to view text entries list-items
            $('.log-entries li').click(function () {
              // text is queried from the <pre> -preformatted tag
              $('.log-entries li').find('pre').slideToggle();
            });
          } else {
            throw new Error(
              `No Course Logs could be found for ${courseId} Course under the uvuid ${uvuId}`
            );
          }
        })
        .catch((error) => {
          // Appropriate error handling
          console.log(error);
          // Create a Div to set our warning within
          var errorDiv = $('<div>')
            .addClass(
              'font-bold border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700'
            )
            .text(error.message);
          // Append the error message to the body of the document
          $('body').append(errorDiv);
          // Remove the error message after 5 seconds
          setTimeout(function () {
            errorDiv.remove();
          }, 5000);
        });
    }

    // post
    // construct log entry object
    $('#addLog').click(function () {
      const textareaInput = $('#logEntry').val();
      if (!textareaInput) {
        // Exit the function if textarea is empty
        return;
      }

      // create entry
      const entry = {
        courseId: $('#course').val(),
        uvuId: $('#uvuId').val(),
        date: new Date().toLocaleString(),
        text: textareaInput,
        id: Math.random().toString(36).substring(2, 9),
      };

      // Do something with the input (e.g. send it to a server via Axios)
      // Send the POST request, GEt to repopulate log entry list
      axios
        // insert new log entry to server json object
        .post(
          'https://jsonserverpazgcu-umxz--3000.local-credentialless.webcontainer.io/api/v1/logs',
          entry
        )
        .then((data) => {
          const courseId = $('#course').val();
          const uvuId = event.target.value;

          axios
            // call to re-populate log with new entries
            .get(
              `
          https://jsonserverpazgcu-umxz--3000.local-credentialless.webcontainer.io/api/v1/logs?courseId=${courseId}&uvuId=${uvuId}`
            )
            .then((response) => {
              return response.data;
            })
            .then((data) => {
              // Get the log entries container
              const logEntries = $('#logs');
              // Clear the container before appending new entries
              logEntries.empty();
              // Iterate over the log data
              data.forEach((log) => {
                // set h3 header
                // Update the innerHTML to show the chosen UVU ID
                $('#uvuIdDisplay').removeClass('d-none');
                $('#uvuIdDisplay').addClass('pt-8 text-xl font-[`RajdBold`]');
                $('#uvuIdDisplay').show();
                $('#uvuIdDisplay').html(`Student Logs for ${log.uvuId}`);
                // Create a new list item
                const logItem = $(`<li>`);

                // Create the log date element
                const logDate = $(`<div><small>${log.date}</small></div>`);
                $('small').addClass(
                  'text-lg font-[`RajdSemi`] border-x-gray-300'
                );

                // Create the log text element
                const logText = $(`<pre><p>${log.text}</p></pre>`);

                // Append the date and text elements to the list item
                logItem.append(logDate);
                logItem.append(logText);
                // Append the list item to the log entries container
                logEntries.append(logItem);
              });

              // add css classes to new elements
              $('.log-entries').addClass(
                'p-2 bg-gray-100 border-2 border-solid block'
              );
              $('.log-entries li').addClass(
                'rounded p-2 bg-gray-100 border-2 border-solid block'
              );
              $('div small').addClass('rounded text-base border-x-gray-300');
              $('pre').addClass(
                'rounded font-[`RajdReg`] border-solid border-inherit whitespace-pre-wrap'
              );

              // re-activate addLog button
              $('#addLog')
                .prop('disabled', false)
                .removeClass('opacity-20 cursor-not-allowed');
              // display only log dates with on click event to view text entries list-items
              $('.log-entries li').click(function () {
                // text is queried from the <pre> -preformatted tag
                $(this).find('pre').slideToggle();
              });
            });
        })
        .catch((error) => {
          console.log(error);
        });
      event.preventDefault();
      $('#logEntry').val('');
    });
  });
});
