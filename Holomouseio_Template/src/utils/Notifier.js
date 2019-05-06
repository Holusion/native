import { Toast } from "native-base";

const showMessage = (msg, duration, type) => {
    let options = {
        text: msg,
        duration: duration,
        position: 'top'
    }

    if(type) {
        options['type'] = type;
    }
    
    Toast.show(options)
}

export const pushError = (errorMsg) => {
    showMessage(errorMsg, 5000, danger);
}

export const pushInfo = (infoMsg) => {
    showMessage(infoMsg, 5000);
}

export const pushWarning = (warnMsg) => {
    showMessage(warnMsg, 5000, 'warning');
}

export const pushSuccess = (successMsg) => {
    showMessage(successMsg, 5000, 'success');
}