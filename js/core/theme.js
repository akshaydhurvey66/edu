/*==================================================
File Name   : theme.js
Module      : Core
Version     : 0.2
Project     : Edu Work
Purpose     : Theme Manager
==================================================*/



/*==================================================
SECTION 01
VARIABLES
==================================================*/

const STORAGE_KEY = "eduwork-theme";

let themeButton = null;



/*==================================================
SECTION 02
INITIALIZE
==================================================*/

export function initializeTheme(){

    themeButton = document.getElementById("themeButton");

    loadTheme();

    registerEvents();

}



/*==================================================
SECTION 03
REGISTER EVENTS
==================================================*/

function registerEvents(){

    if(!themeButton){

        return;

    }

    themeButton.addEventListener(

        "click",

        toggleTheme

    );

}



/*==================================================
SECTION 04
TOGGLE THEME
==================================================*/

function toggleTheme(){

    const darkMode = document.body.classList.toggle("dark");

    if(darkMode){

        themeButton.textContent = "☀️";

        localStorage.setItem(

            STORAGE_KEY,

            "dark"

        );

    }

    else{

        themeButton.textContent = "🌙";

        localStorage.setItem(

            STORAGE_KEY,

            "light"

        );

    }

}



/*==================================================
SECTION 05
LOAD SAVED THEME
==================================================*/

function loadTheme(){

    const savedTheme = localStorage.getItem(

        STORAGE_KEY

    );

    if(savedTheme === "dark"){

        document.body.classList.add(

            "dark"

        );

        if(themeButton){

            themeButton.textContent = "☀️";

        }

    }

    else{

        document.body.classList.remove(

            "dark"

        );

        if(themeButton){

            themeButton.textContent = "🌙";

        }

    }

}