/*==================================================
File Name   : sw.js
Module      : PWA
Version     : 0.1
Project     : Edu Work
Purpose     : Basic Service Worker
==================================================*/



/*==================================================
SECTION 01
CACHE INFORMATION
==================================================*/

const CACHE_NAME = "edu-work-v0.1";



/*==================================================
SECTION 02
FILES TO CACHE
==================================================*/

const APP_FILES = [

    "./",

    "./index.html",

    "./manifest.json"

];



/*==================================================
SECTION 03
INSTALL
==================================================*/

self.addEventListener("install",(event)=>{

    event.waitUntil(

        caches.open(CACHE_NAME)

        .then(cache=>{

            return cache.addAll(APP_FILES);

        })

    );

    self.skipWaiting();

});



/*==================================================
SECTION 04
ACTIVATE
==================================================*/

self.addEventListener("activate",(event)=>{

    event.waitUntil(

        caches.keys()

        .then(keys=>{

            return Promise.all(

                keys.map(key=>{

                    if(key!==CACHE_NAME){

                        return caches.delete(key);

                    }

                })

            );

        })

    );

    self.clients.claim();

});



/*==================================================
SECTION 05
FETCH
Network First Strategy
==================================================*/

self.addEventListener("fetch",(event)=>{

    event.respondWith(

        fetch(event.request)

        .catch(()=>{

            return caches.match(event.request);

        })

    );

});