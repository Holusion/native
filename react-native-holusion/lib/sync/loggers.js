import { Toast } from "native-base"

/**
 * @typedef Logger
 * @method onProgress
 * @method onError
 * @method onDispatch
 */

/**
 * @type Logger
 */
export const consoleLogger = {
  onProgress: (m)=>console.warn("watchFiles Progress : ", m.join(", ")),
  onError: (e)=>console.error("watchFiles ", e),
  onDispatch: (data)=>console.warn("Dispatch data : ",JSON.stringify(
    data, 
    (k, v) =>  k && v && typeof v !== "number" ? (Array.isArray(v) ? "[object Array]" : "" + v) : v 
  )),
}
/**
 * @type Logger
 */
class ToastLogger {
  constructor(){
    this._messages=[];
    this.has_error;
  }
  push(...m){
    this._messages.push(...m)
    this.show();
  }
  findIndex(fn){
    return this._messages.findIndex(fn);
  }
  splice(idx){
    return this._messages.splice(idx, 1)[0];
  }
  shift(){
    return this._messages.shift();
  }
  get length(){
    return  this._messages.length;
  }
  onProgress (m){
    this.push({
      severity: "info",
      text: m.join(", ")
    });
  }
  onError (e){
    console.error("watchFile :", e);
    this.push({
      severity: "danger",
      text: e.message
    })
  }
  onDispatch (data){
    this.push({
      severity: "success",
      text: `${Object.keys(data).map(k=>`"${k}"`).join(", ")} mis à jour`
    })
  }
  show(){
    if(this.length === 0) return;
    let errorIndex = this.findIndex((m)=>m.severity === "danger");
    if(errorIndex !== -1){
      let error = this.splice(errorIndex);
      return Toast.show({
        buttonText: "ignorer",
        text: error.text,
        type: "danger",
        onClose: ()=>{
          this.show();
        }
      })
    }
    let next_message = this.shift();
    let text = this.length? `(+${this.length})`: ""
    text+= next_message.text;
    Toast.show({
      buttonText: "cacher",
      text,
      duration: 2000,
      type: next_message.severity,
      onClose: ()=>{
        this.show();
      }
    })
  }
}
export const toastLogger = new ToastLogger();