# Staff Recruitment Application
A simple app for in-oganization staff recruitment

## Table of Content
* [General Info](#general-info)
* [Setup and Installation ](#setup-and-installation)
* [Database Setup](#database-setup)
* [Code Setup and Running](#code-setup-and-running)

## General-Info
This project is a simple in-oganization staff recruitment application

## Setup and Installation

To use this application first of all you need to have some app downloaded some of which are:
* node.js
* vscode
* Xampp

of which nodejs and vscode can be gotten from their official cites.

## Database Setup

after installation, open the "xampp control panel" and start "Apache" and "MySQL" Actions

then you will also click on the admin to access the sql local server or just copy and paste this url in your browser "http://localhost/phpmyadmin/"

create a database of your choice and change the database name in our app.js file or just use the name "job_applications"

you then need to go to the named file command.sql in our code and copy each sql query one by one and paste into the sql under the database you are working with.

## code setup and running

to run the code some commands need to be run first in the terminal
```
$ npm i"
```
this is to install all your dependencies
```
$ npm start
``` 
or
```
$ node app.js
```
this is to start your server

then on your browser, type localhost with the port number you are using
the one on this code is this "http://localhost:3000"