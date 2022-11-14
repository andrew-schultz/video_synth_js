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
Liquid Light show:
- try to programatically recreate a liquid light show
- maybe make a canvas that covers the whole screen on top of everything else?
    - has some opacity/transparency so you can see video/objects behind
- how to handle shapes of blobs?
    - maybe theres some physics support in there we can use to kind of fake the blobs being stretched and contracted?

variables / attributes:
-------
- container
    - max area
    - boundaries for blobs to push up against
        - provides pressure on the outside (away from center) side of blobs as they get pushed closer

- pressure
    - float
    - value to represent if the lense/dish is being pushed down or pulled up, and by how much from the 0/starting point
    - negative value is UP, positive is DOWN
    - negative value would cause things to come closer to center 
    - positive value would cause things to be pushed farther from center

- active_surface_area
    - float
    - represents size of "lense"/"dish" being pressed down/pulled up
    - should get larger as "pressure" value goes up(positive), smaller as "pressure" value goes down(negative)

-  blobs
    - array of "blob" objects

- solution_color
    - main "background" color
        - imagine the main solution that the oils are squirted into 
        - rgba value

- blob
    - object/class
    - color
        - its color/hex code/rgb(a) value
    - opacity
        - use with color
    - starting_size
        - default starting size when pressure is at 0
    - size
        - calculated value of `starting_size * pressure_modifier`
            - pressure modifier can be just the pressure value or the pressure value mapped to a specific range
 

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
