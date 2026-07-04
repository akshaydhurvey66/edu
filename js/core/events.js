/*==================================================
File Name   : events.js
Module      : Core
Version     : 0.1
Project     : Edu Work
Purpose     : Global Event Manager
==================================================*/



/*==================================================
SECTION 01
APPLICATION EVENTS
==================================================*/

const appEvents = new Map();



/*==================================================
SECTION 02
REGISTER EVENT
==================================================*/

export function on(eventName, callback){

    if(!appEvents.has(eventName)){

        appEvents.set(eventName,[]);

    }

    appEvents.get(eventName).push(callback);

}



/*==================================================
SECTION 03
REMOVE EVENT
==================================================*/

export function off(eventName, callback){

    if(!appEvents.has(eventName)){

        return;

    }

    const listeners = appEvents.get(eventName);

    const index = listeners.indexOf(callback);

    if(index > -1){

        listeners.splice(index,1);

    }

}



/*==================================================
SECTION 04
EMIT EVENT
==================================================*/

export function emit(eventName, data = null){

    if(!appEvents.has(eventName)){

        return;

    }

    const listeners = appEvents.get(eventName);

    listeners.forEach(listener => {

        listener(data);

    });

}



/*==================================================
SECTION 05
WINDOW RESIZE
==================================================*/

export function registerResizeEvent(){

    window.addEventListener("resize", () => {

        emit("window:resize");

    });

}



/*==================================================
SECTION 06
VISIBILITY CHANGE
==================================================*/

export function registerVisibilityEvent(){

    document.addEventListener("visibilitychange", () => {

        emit("app:visibility", document.hidden);

    });

}



/*==================================================
SECTION 07
ONLINE STATUS
==================================================*/

export function registerConnectionEvents(){

    window.addEventListener("online", () => {

        emit("network:online");

    });

    window.addEventListener("offline", () => {

        emit("network:offline");

    });

}



/*==================================================
SECTION 08
INITIALIZE EVENTS
==================================================*/

export function initializeEvents(){

    registerResizeEvent();

    registerVisibilityEvent();

    registerConnectionEvents();

}