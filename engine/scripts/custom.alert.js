function displayErrorAlert(inputText){
	swal({
		text: inputText,
		icon: "error",
		buttons: {
			cancel: {
				text: "Close",
				//value: true,
				visible: true,
				className: "btn btn-outline-danger",
				closeModal: true
			}
		}
	});
}

function displayInfoAlert(inputText){
	swal({
		text: inputText,
		icon: "info",
		buttons: {
			cancel: {
				text: "Okay",
				//value: true,
				visible: true,
				className: "btn btn-outline-info",
				closeModal: true
			}
		}
	});
}


function displayConfirmAlert(inputText, onDeleteCallBack){
	return swal({
	  //title: "Are you sure?",
	  text: inputText,
	  icon: "warning",
	  buttons: {
			cancel: {
				text: "Cancel",
				//value: true,
				visible: true,
				className: "btn btn-outline-primary",
				closeModal: true
			},
			confirm: {
				text: "Confirm",
				value: true,
				visible: true,
				className: "btn btn-outline-danger",
				closeModal: true
			}

		},
	  dangerMode: true,
	})
	.then((willDelete) => {
	  if (willDelete) {
	    onDeleteCallBack();
	  }
	});	
}

function displayConfirmAlertSuccess(inputText, onSaveCallBack){
	return swal({
	  //title: "Are you sure?",
	  text: inputText,
	  icon: "info",
	  buttons: {
			cancel: {
				text: "Cancel",
				//value: true,
				visible: true,
				className: "btn btn-outline-primary",
				closeModal: true
			},
			confirm: {
				text: "Save changes",
				value: true,
				visible: true,
				className: "btn btn-outline-success",
				closeModal: true
			}

		},
	  dangerMode: false,
	})
	.then((willSave) => {
	  if (willSave) {
	    onSaveCallBack();
	  }
	});	
}