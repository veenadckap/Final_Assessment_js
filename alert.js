// alerts.js

function showSuccessAlert(message) {
    Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: message,
        confirmButtonText: 'OK'
    });
}

function showErrorAlert(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: message,
        confirmButtonText: 'OK'
    });
}

function showWarningAlert(message) {
    Swal.fire({
        icon: 'warning',
        title: 'Warning!',
        text: message,
        confirmButtonText: 'OK'
    });
}


