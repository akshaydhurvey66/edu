/*==================================================
File Name   : sidebar.js
Module      : Layout
Version     : 0.1
Project     : Edu Work
Purpose     : Sidebar Navigation Controller
==================================================*/



/*==================================================
SECTION 01
DOM ELEMENTS
==================================================*/

let sidebar = null;

let overlay = null;

let menuButton = null;


/*==================================================
SECTION 02
APPLICATION STATE
==================================================*/

let sidebarOpened = false;



/*==================================================
SECTION 03
INITIALIZE DOM
==================================================*/

function initializeDom(){

    sidebar = document.getElementById("sidebar");

    overlay = document.getElementById("sidebarOverlay");

    menuButton = document.getElementById("menuButton");

}



/*==================================================
SECTION 04
OPEN SIDEBAR
==================================================*/

export function openSidebar(){

    if(!sidebar) return;

    sidebar.classList.add("open");

    overlay.classList.add("show");

    sidebarOpened = true;

}



/*==================================================
SECTION 05
CLOSE SIDEBAR
==================================================*/

export function closeSidebar(){

    if(!sidebar) return;

    sidebar.classList.remove("open");

    overlay.classList.remove("show");

    sidebarOpened = false;

}



/*==================================================
SECTION 06
TOGGLE SIDEBAR
==================================================*/

export function toggleSidebar(){

    if(sidebarOpened){

        closeSidebar();

        return;

    }

    openSidebar();

}



/*==================================================
SECTION 07
REGISTER EVENTS
==================================================*/

function registerEvents(){

    menuButton.addEventListener("click",toggleSidebar);

    overlay.addEventListener("click",closeSidebar);

    document.addEventListener("keydown",(event)=>{

        if(event.key==="Escape"){

            closeSidebar();

        }

    });

}



/*==================================================
SECTION 08
INITIALIZE SIDEBAR
==================================================*/

export function initializeSidebar(){

    initializeDom();

    registerEvents();

}