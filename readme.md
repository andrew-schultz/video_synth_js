https://apple.stackexchange.com/questions/221980/os-x-route-audio-output-to-audio-input

idea!!!

For that cool spiraling john mayer effect
- at end of draw loop, capture screen, save to var
- on new draw (maybe on a set interval if we dont want like every frame) set capture img to background
- draw new frame on top of old one
- repeat


For Shader Park:
make a hidden (css or literally off screen) canvas element
draw shader park code to canvas
wrap canvas around 3d objects or fill coords / background 

Redis:
- To start:
    - starts automatically with npm start
        - kicked off in server.js I think
        - or its just been running 5ever in a background service locally


----------------------
TO START:
---------
`npm start`
`node server.js` also works

on site options:
- video source can be any valid camera detected by js (gotta give permissions if it complains)
- audio source should be `aggregate device`

Audio MiDi Setup:
-----------------
- Audio Input
    - BlackHole 2ch
- Audio Output
    - Multi-Output Device
        - master device: BlackHole 2ch
        - sample rate: 44.1kHz
    - toggle `ON` both BlackHole 2ch and Primary output device 
        - default primary output device should be 'MacBook Pro Speakers'
        - also any other output devices that you're connected 
