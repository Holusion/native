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
    showMessage(errorMsg, 10000, danger);
}

export const pushInfo = (infoMsg) => {
    showMessage(infoMsg, 10000);
}

export const pushWarning = (warnMsg) => {
    showMessage(warnMsg, 10000, 'warning');
}

export const pushSuccess = (successMsg) => {
    showMessage(successMsg, 10000, 'success');
}