// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
  
  function readBlob(files, opt_startByte, opt_stopByte) {
    if (!files.length) {
      alert('Please select a file!');
      return;
    }

    var file = files[0];
    var start = parseInt(opt_startByte) || 0;
    var stop = parseInt(opt_stopByte) || file.size - 1;

    var reader = new FileReader();

    // If we use onloadend, we need to check the readyState.
    reader.onloadend = function(evt) {
      if (evt.target.readyState == FileReader.DONE) { // DONE == 2
        // document.getElementById('byte_content').textContent = evt.target.result;
        parseICAL(evt.target.result);
      }
    };

    var blob = file.slice(start, stop + 1);
    reader.readAsBinaryString(blob);
  }

  function parseICAL(content){
  	// Get the basic data out
	var jCalData = ICAL.parse(content);
	var comp = new ICAL.Component(jCalData[1]);

	// Fetch the VEVENT part
	var vevent = comp.getFirstSubcomponent('vevent');
	var event = new ICAL.Event(vevent);

	$('#ics_from').text(event.organizer[0].jCal[1].cn + ' <' + event.organizer[0].jCal[3].replace('mailto:','') + '>');
	$('#ics_summary').text(event.summary);
	$('#ics_description').text(event.description);
	$('#ics_location').text(event.location);
	$('#ics_when').text('DURATION: ' + event.duration.toICALString() + ' START: ' + event.startDate.toJSDate() + ' END: ' + event.endDate.toJSDate());
	for (var i = 0; i < event.attendees.length; i++) {
		$('#ics_attendees').append('<br/>' + event.attendees[i].jCal[1]['cn'] + ' (' + event.attendees[i].jCal[3].replace('mailto:','') + ')');
	};
	

	console.log(event);

	// Get start and end dates as local time on current machine
	// console.log(event.startDate.toJSDate(), event.endDate.toJSDate());
  }

  function handleFileDrop(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    listFiles(files);
  }

  function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    listFiles(files);
  }

  function listFiles(files){
    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
      output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
                  f.size, ' bytes, last modified: ',
                  f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
                  '</li>');
    }
    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';

    readBlob(files);
  }

  function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

  // Setup the dnd listeners.
  var dropZone = document.getElementById('drop_zone');
  dropZone.addEventListener('dragover', handleDragOver, false);
  dropZone.addEventListener('drop', handleFileDrop, false);
  document.getElementById('upload_file').addEventListener('change', handleFileSelect, false);

  $('#upload').click(function(){
    $('#upload_file').click();
    return false;
});

} else {
  alert('The File APIs are not fully supported in this browser.');
}