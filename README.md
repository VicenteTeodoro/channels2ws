**Channel to WebSocket (Channel2Ws)**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Project Mission
----------

To provide an easy, stable, and security way to access local channels through a websocket connection.

What is a Channel
----------

A channel might be anything that can send data or you can request data from. Right now we are providing two different channels: Serial and TCP ports.

Installation
----------
As a regular nodejs project you need to run **npm install** command, but before you do that you must be sure that you have the latest **phyton 2.7.x** version installed.


Usage
----------
You can run **node ./index.js** for fun or run **npm run-script build**.

After build the project, in the **./dist** folder there will be the **channel2ws.exe** executable file.

You can use the powershell or cmd to run this executable and you will see which port it will use to access the user interface. Ex.: http://localhost:3000

Also you can turn the executable as a service on Windows. For that, run the executable file with the **--add** parameter. Ex.: **channel2ws.exe --add**

Use **channel2ws.exe --remove** to remove the service.

Note
----------
Together with the executable file you also have to distribute any folder inside of the **./dist** folder. This is a self contained application and users are not required to install **nodejs**.