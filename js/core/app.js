/*==================================================
File Name   : app.js
Module      : Core
Version     : 0.1
Project     : Edu Work
Purpose     : Main Application Bootstrap
==================================================*/



/*==================================================
SECTION 01
IMPORTS
==================================================*/


import { APP } from "./config.js";


import { initializeEvents } from "./events.js";

import {

    initializeSidebar,

    openSidebar,

    closeSidebar,

    toggleSidebar

} from "../layout/sidebar.js";


import {

    initializeTheme

} from "./theme.js";


import {

    initializeInputBox

} from "../layout/inputBox.js";


/*==================================================
SECTION 02
APPLICATION START
==================================================*/

function startApplication(){

    console.clear();

    console.log(

        `${APP.name} ${APP.version}`

    );

    console.log(

        "Edu Work Started Successfully"

    );

}



/*==================================================
SECTION 03
LOAD MODULES
==================================================*/

function loadModules(){

    initializeSidebar();

    initializeTheme();
    
    initializeInputBox();

}


/*==================================================
SECTION 04
REGISTER EVENTS
==================================================*/

function registerApplicationEvents(){

    initializeEvents();

}



/*==================================================
SECTION 05
BOOT APPLICATION
==================================================*/

function boot(){

    startApplication();

    loadModules();

    registerApplicationEvents();

}


/*==================================================
SECTION 06
DOM READY
==================================================*/

document.addEventListener(

    "DOMContentLoaded",

    boot

);



/*==================================================
SECTION 07
GLOBAL DEBUG
==================================================*/

window.eduWork={

    openSidebar,

    closeSidebar,

    toggleSidebar

};