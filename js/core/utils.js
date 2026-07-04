/*==================================================
File Name   : utils.js
Module      : Core
Version     : 0.1
Project     : Edu Work
Purpose     : Common Utility Functions
==================================================*/



/*==================================================
SECTION 01
QUERY SELECTOR
==================================================*/

export const $ = (selector) => {

    return document.querySelector(selector);

};



/*==================================================
SECTION 02
QUERY SELECTOR ALL
==================================================*/

export const $$ = (selector) => {

    return document.querySelectorAll(selector);

};



/*==================================================
SECTION 03
CREATE ELEMENT
==================================================*/

export function createElement(tag){

    return document.createElement(tag);

}



/*==================================================
SECTION 04
ADD CLASS
==================================================*/

export function addClass(element,className){

    if(!element) return;

    element.classList.add(className);

}



/*==================================================
SECTION 05
REMOVE CLASS
==================================================*/

export function removeClass(element,className){

    if(!element) return;

    element.classList.remove(className);

}



/*==================================================
SECTION 06
TOGGLE CLASS
==================================================*/

export function toggleClass(element,className){

    if(!element) return;

    element.classList.toggle(className);

}



/*==================================================
SECTION 07
HAS CLASS
==================================================*/

export function hasClass(element,className){

    if(!element) return false;

    return element.classList.contains(className);

}



/*==================================================
SECTION 08
SET TEXT
==================================================*/

export function setText(element,text){

    if(!element) return;

    element.textContent=text;

}



/*==================================================
SECTION 09
SET HTML
==================================================*/

export function setHTML(element,html){

    if(!element) return;

    element.innerHTML=html;

}



/*==================================================
SECTION 10
UNIQUE ID
==================================================*/

export function createId(){

    return crypto.randomUUID();

}



/*==================================================
SECTION 11
CURRENT DATE
==================================================*/

export function currentDate(){

    return new Date();

}



/*==================================================
SECTION 12
FORMAT TIME
==================================================*/

export function currentTime(){

    return new Date().toLocaleTimeString();

}