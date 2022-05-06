export const checkUsername = (username) => {
    const regEx = /^[a-zA-Z0-9]{6,25}$/;
    if (!regEx.test(username)) return;
    return true;
};

export const checkEmail = (email) => {
    const regEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!regEx.test(email)) return;
    return true;
};

export const checkPassword = (password) => {
    const regEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
    if (!regEx.test(password)) return;
    return true;
};

// change image data url to blob 
export const dataURItoBlob = (dataURI) => {
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    let ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
}

// validate inputs before registering the user
export const checkInputs = (data) => {
    if (!data.name && !data.username && !data.email && !data.password && !data.confirmPassword) {
        return "you must all enter fields to register";
    } else if (!data.name) {
        return "name is required";
    } else if (!data.username) {
        return "username is required";
    } else if (!checkUsername(data.username)) {
        return "username must be between 6 to 25 characters long and special characters must be excluded";
    } else if (!data.email) {
        return "email is required";
    } else if (!checkEmail(data.email)) {
        return "invalid email address";
    } else if (!data.password) {
        return "password is required";
    } else if (!data.confirmPassword) {
        return "confirm password is required";
    } else if (!checkPassword(data.password)) {
        return "password must be minimum eight characters, at least one uppercase letter, one lowercase letter and one number";
    } else if (data.password !== data.confirmPassword) {
        return "passwords do not match";
    } else {
        return true;
    }
}