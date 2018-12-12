function displayErrorAlert(inputText){
	swal({
		text: inputText,
		icon: "error",
		buttons: {
			cancel: {
				text: "Close",
				//value: true,
				visible: true,
				className: "btn btn-outline-danger pixel-font",
				closeModal: true
			}
		}
	});
}

function displayErrorAlertWithCallback(inputText, callback){
	swal({
		text: inputText,
		icon: "error",
		buttons: {
			cancel: {
				text: "Close",
				//value: true,
				visible: true,
				className: "btn btn-outline-danger pixel-font",
				closeModal: true
			}
		}
	}).then((value)=>{
		callback();		
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
				className: "btn btn-outline-info pixel-font",
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
				className: "btn btn-outline-primary pixel-font",
				closeModal: true
			},
			confirm: {
				text: "Confirm",
				value: true,
				visible: true,
				className: "btn btn-outline-danger pixel-font",
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
				className: "btn btn-outline-primary pixel-font",
				closeModal: true
			},
			confirm: {
				text: "Save changes",
				value: true,
				visible: true,
				className: "btn btn-outline-success pixel-font",
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