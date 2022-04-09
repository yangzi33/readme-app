const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || "http://localhost:5000"

/**
 * Formats phone number by adding dashes.
 * @param phoneInput The phone number
 * @returns {string}
 */
function formatPhoneNumber(phoneInput) {
    phoneInput = phoneInput.replaceAll('-', '');

    if (phoneInput.length > 6) {
        phoneInput = phoneInput.substring(0, 6) + '-' + phoneInput.substring(6, phoneInput.length)
    }

    if (phoneInput.length > 3) {
        phoneInput = phoneInput.substring(0, 3) + '-' + phoneInput.substring(3, phoneInput.length)
    }

    return phoneInput;
}

/**
 * Capitalizes the first letter of the username.
 * @param user The username.
 * @returns {string}
 */
function formatUser(user) {
    if (user.length < 1) {
        return ""
    }

    return user[0].toUpperCase() + user.substring(1, user.length);
}

/**
 * Ensures the username/password is registered.
 * @param user The username
 * @param pass The password
 * @returns {boolean}
 */
function validateUserPass(user, pass, registeredUsers) {
    return registeredUsers.includes((user, pass));
}

function authFetch(component, input, headers) {
    let fetchCmd;

    if (headers) {
        headers.credentials = "include"
        fetchCmd = fetch(input, headers)
    } else {
        fetchCmd = fetch(input, {
            credentials: "include"
        })
    }

    return fetchCmd.then(res => {
        if (res.status === 200) {
            return res.json()
        } else {
            if (res.status === 401) {
                component.props.history.push("/", {redirect: "You are no longer logged in. Please log in again."})
            }

            return Promise.reject(res.text())
        }
    })
}

export {formatPhoneNumber, formatUser, validateUserPass, authFetch, BACKEND_URL, FRONTEND_URL}