// toastify.js

function showToast(message, type = "success") {
    let bgColor;

    switch (type) {
        case "success":
            bgColor = "linear-gradient(to right, #00b09b, #96c93d)";
            break;
        case "error":
            bgColor = "linear-gradient(to right, #ff5f6d, #ffc371)";
            break;
        case "info":
            bgColor = "linear-gradient(to right, #2193b0, #6dd5ed)";
            break;
        default:
            bgColor = "linear-gradient(to right, #00b09b, #96c93d)";
    }

    Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: bgColor,
        stopOnFocus: true,
    }).showToast();
}

