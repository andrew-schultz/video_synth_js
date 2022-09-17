
// ===================
// toggles
// ===================

var fillOn = 1 // integer 1 or 0 -- removes fill on walls
var linesAndWalls = false // boolean
var metronomeBoxes = true // boolean
var movingCenter = true // boolean
var middleSphere = true // boolean
var justLines = false // boolean
var rectangle_video = false; // boolean
var justWalls = false
var movingSphere = false
var lockCenters = false
var movingSphereSmooth = true

// ===================
// end toggles
// ===================

// var token;
// var authToken;

// var initialize = function( query ) {
//     var preTerm;
  
//     if ( query && query.length > 0 ) {
//         preTerm = query;
//     }
//     debugger
//     var xmlHttp = new XMLHttpRequest();
//     xmlHttp.open( 'POST', '/token', true ); // true for asynchronous
//     xmlHttp.onreadystatechange = function() {
//         if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) {
//             var results = JSON.parse( xmlHttp.response );
//             token = results.access_token;
//             if ( preTerm && preTerm.length > 0 ) {
//                 search( preTerm );
//             }
//         }
//     };
  
//     xmlHttp.send();
// };

// const getCache = function( key ) {
//     var xmlHttp = new XMLHttpRequest();
//     xmlHttp.open( 'GET', '/cache', true ); // true for asynchronous
//     xmlHttp.onreadystatechange = function() {
//         if ( xmlHttp.readyState == 4 && xmlHttp.status == 200 ) {
//             // var results = JSON.parse( xmlHttp.response );
//             var results = xmlHttp.response;
//             console.log(results)
//             // debugger
//             return results
//         }
//     };
  
//     xmlHttp.send();
// };

// export const fakePOSTConnect = () => {
// 	return fetch('http://localhost:3000', {
// 		headers: {
// 			'Content-Type': 'application/json'
// 		},
// 		method: 'POST',
// 		body: JSON.stringify({ test: 'POST' })
// 	}).then((response) => {
// 		console.log(response);
// 	})
// };

  
// if ( window.location.hash ) {
//     var queryParams = window.location.hash.slice( 2 ).split( '&' );
//     var result = {};
//     queryParams.forEach( function( param ) {
//         param = param.split( '=' );
//         result[ param[ 0 ] ] = decodeURIComponent( param[ 1 ] || '' );
//     } );
  
//     var params = JSON.parse( JSON.stringify( result ) );
//     debugger
//     if ( params.access_token ) {
//         authToken = params.access_token;
//         // document.getElementById( 'loginButton' ).style.display = 'none';
//     }
// }


const initialize = () => {
    // this isn't going to work until I get https working......
    navigator.mediaDevices.enumerateDevices().then((devices) => {
        // debugger
        var videoSelect = document.getElementById('videoSourceSelect');
        var audioSelect = document.getElementById('audioSourceSelect');

        videoSelect.innerHTML = '';
        audioSelect.innerHTML = '';

        devices.forEach((device, index) => {
            var option = document.createElement('option');
            option.value = device.deviceId;
            console.log(device)
            if (device.kind.toLowerCase() === 'audioinput') {
                option.text = device.label || 'microphone ' + (audioSelect.length + 1);
                audioSelect.appendChild(option);
            } else if (device.kind.toLocaleLowerCase() === 'videoinput') {
                option.text = device.label || 'camera ' + (videoSelect.length + 1);
                videoSelect.appendChild(option);
            }

        })
    })
}

initialize();

class Visualizer {
    constructor(counter=0, speed=1, frequency=1) {
        this.counter = 0
        this.speed = 1
        this.frequency = 3
        this.center_vertical = 30
        this.center_horizontal = 0
        this.center_vertical_sphere = 90
        this.center_horizontal_sphere = 0
        this.center_z_sphere = 0
        this.purge = 0
        this.lines = 0
        this.cfill = 0
        this.rect_list = []
        this.beat_counter = 0
        this.section_counter = 0
        this.segment_counter = 0
        this.global_bool = {'odd': true, 'even': true}
        this.color_adjust = 0
        this.sphere_list = []
        this.sphere_velocity = createVector(0, 0, 0)
    }
}

class RectObj {
    constructor(width, height, center_vertical=0, center_horizontal=0, cfill=0, first=false) {
        this.counter = 0
        this.width = width
        this.height = height
        this.center_vertical = center_vertical
        this.center_horizontal = center_horizontal
        this.cfill = cfill
        this.first = false
    }
}

class SphereObj {
    constructor(radius, detailX, detailY, cfill=0, cstroke=0) {
        this.counter = 0
        this.radius = radius
        this.detailX = detailX
        this.detailY = detailY
        this.cfill = cfill
        this.cstroke = cstroke
    }
    
}

let visualizer;
let videoDeviceId;
let audioDeviceId;
let capture;
let startAudio = false;
let audioStarted = false;

// the shader variable
let camShader;
var mic;
var vid;
let fft;
let shaderLayer;
let copyLayer;

var amplitude;

var backgroundColor;

// rectangle parameters
var rectRotate = true;
var rectMin = 15;
var rectOffset = 20;
var numRects = 10;

// :: Beat Detect Variables
// how many draw loop frames before the beatCutoff starts to decay
// so that another beat can be triggered.
// frameRate() is usually around 60 frames per second,
// so 20 fps = 3 beats per second, meaning if the song is over 180 BPM,
// we wont respond to every beat.
var beatHoldFrames = 30;

// what amplitude level can trigger a beat?
var beatThreshold = 0.02; 

// When we have a beat, beatCutoff will be reset to 1.1*beatThreshold, and then decay
// Level must be greater than beatThreshold and beatCutoff before the next beat can trigger.
var beatCutoff = 0;
var beatDecayRate = 0.98; // how fast does beat cutoff decay?
var framesSinceLastBeat = 0; // once this equals beatHoldFrames, beatCutoff starts to decay.

var micLevel;

let new_height;
let new_width;

let aspect_ratio;

let rect_color_offset;

// variables for rainbow cycle
let state = 0;
let a = 255;
let r = 255;
let g = 0;
let b = 0;
let rainbowCyclesLeft = 0;

windowResized = () => {
    // aspect_ratio = width / height
    // boils down to something like 1.33 : 1, or 1.33 width units for every 1 height unit

    aspect_ratio = windowWidth / windowHeight;
    // we might want to round this to like 2 or 3 decimals
    resizeCanvas(windowWidth, windowHeight);
}

window.onresize = windowResized

purge = () => {
    visualizer.counter = 1
    visualizer.rect_list = []
}

rainbowCycle = () => {
    if(state == 0){
        g++;
        if(g == 255) {
            state = 1;
        } 
    }
    if(state == 1){
        r--;
        if(r == 0) {
            state = 2;
        }
    }
    if(state == 2){
        b++;
        if(b == 255) {
            state = 3;
        }
    }
    if(state == 3){
        g--;
        if(g == 0) {
            state = 4;
        }
    }
    if(state == 4){
        r++;
        if(r == 255) {
            state = 5;
        }
    }
    if(state == 5){
        b--;
        if(b == 0) {
            state = 0;
        }
    }

    // return r, g, b
}

setRainbowCylce = (times) => {
    var newTime = times - 1
    if (newTime > 0) {
        rainbowCycle()
        return newTime 
    }
    else {
        return 0
    }
}

rainbowCycleOn = (times) => {
    rainbowCyclesLeft = setRainbowCylce(times)
    if (rainbowCyclesLeft > 0) {
        setInterval(rainbowCycleOn(rainbowCyclesLeft), 100)
    }
}

setGradient = (c1, c2) => {
    // noprotect
    noFill();
    for (var y = 0; y < height; y++) {
      var inter = map(y, 0, height, 0, 1);
      var c = lerpColor(c1, c2, inter);
      stroke(c);
      line(0, y, width, y);
    }
}

setVideoSource = () => {
    var videoSelect = document.getElementById('videoSourceSelect');
    videoDeviceId = videoSelect.value

    if (vid) {
        // debugger
        vid.getSources().then(devices => {
            devices.forEach((device, i) => {
                vid.setSource(i)
                vid.start()
                console.log(vid)
                // debugger
            })
        })
    }
}

setAudioSource = () => {
    var audioSelect = document.getElementById('audioSourceSelect');
    audioDevice = audioSelect.value

    if (mic) {
        mic.getSources().then(devices => {
            devices.forEach((device, i) => {
                if (device.deviceId == audioDevice) {
                    mic.setSource(i)
                    mic.start()
                    console.log(mic)
                }
            })
        });
    }
}

startLoop = () => {
    var videoSelect = document.getElementById('videoSourceSelect');
    var audioSelect = document.getElementById('audioSourceSelect');
    var startButton = document.getElementById('start');

    videoSelect.style.display = 'none';
    audioSelect.style.display = 'none';
    startButton.style.display = 'none';

    // let constraints = {
    //     video: {
    //         deviceId: videoDeviceId,
    //         optional: [{ maxFrameRate: 10 }]
    //     },
    //     audio: false
    // }

    // capture = createCapture(constraints);
    // capture.size(width/2, height/2)
    // capture.size(640, 480)
    // capture.hide();

    startAudio = true;
    loop();
}

// for 3d / webgl camera capture
preload = () => {
    //   load the shader
    // camShader = loadShader('/shaders/sinewave_distortion/effect.vert', '/shaders/sinewave_distortion/effect.frag');
    // camShader = loadShader('/shaders/video_feedback/effect.vert', '/shaders/video_feedback/effect.frag');
    camShader = loadShader('/shaders/rgb_to_hsb/effect.vert', '/shaders/rgb_to_hsb/effect.frag');
}

detectBeat = (level, micLevel) => {
    if (level  > beatCutoff && level > beatThreshold) {
        rainbowCycleOn(50);
        onBeat(micLevel);
        beatCutoff = level *1.2;
        framesSinceLastBeat = 0;
    } else{
        if (framesSinceLastBeat <= beatHoldFrames) {
            framesSinceLastBeat ++;
        }
        else{
            beatCutoff *= beatDecayRate;
            beatCutoff = Math.max(beatCutoff, beatThreshold);
        }
    }
}
  
onBeat = (micLevel) => {
    // console.log('add that beat')

    if (movingCenter) {
        moveCenter(micLevel)
    }
    if (movingSphere) {
        moveSphereCenter(micLevel)
    }
    if (movingSphereSmooth) {
        updateSphereVelocity(micLevel)
    }
    addRect(micLevel)
    // addSphere(micLevel)
}

addSphere = (micLevel) => {
    let cv = (visualizer.center_vertical)
    let ch = (visualizer.center_horizontal)
    sphere_color_offset = map(micLevel, 0, 0.25, 50, 255)
    var sphereObj = new SphereObj(
        1,
        16,
        16,
    )
    visualizer.sphere_list.push(sphereObj)
}

addRect = (micLevel) => {
    let cv = (visualizer.center_vertical)
    let ch = (visualizer.center_horizontal)
    rect_color_offset = map(micLevel, 0, 0.25, 50, 255)
    var rect_obj = new RectObj(
        new_width, new_height,
        center_vertical=cv, center_horizontal=ch,
        cfill=rect_color_offset)
        // cfill=visualizer.color_adjust)
    visualizer.rect_list.push(rect_obj)
    visualizer.beat_counter += 1
}

// maybe the function thats called be onBeat should be different from the one that actually moves the sphere
// the onBeat one just updates the velocity/directio


moveSphereSmooth = () => {
    var startX = visualizer.center_vertical_sphere;	// set the x-coordinate for the circle center
    var startY = visualizer.center_horizontal_sphere;	// set the y-coordinate for the circle center
    var startZ = visualizer.center_z_sphere;
    var xlimit = 80
    var ylimit = 100
    var zlimit = 30
    var current_velocity = visualizer.sphere_velocity
    var currentPosition = createVector(startX, startY, startZ)
    
    // edge detection

    var newX = visualizer.sphere_velocity.x
    var newY = visualizer.sphere_velocity.y
    var newZ = visualizer.sphere_velocity.z

    if (startX < -xlimit) {
        if (newX < 0) {
            newX = newX * -1
            newZ = newZ * -1
        }
    } 
    else if (startX > xlimit) {
        // if x is already negative dont do anything cause you'll make it positive you dummy
        if (newX > 0) {
            newX = newX * -1
            newZ = newZ * -1
        } 
    }
    //------- 
    if (startY < -ylimit) {
        if (newY < 0) {
            newY = newY * -1
        }
    }
    else if (startY > ylimit) {
        if (newY > 0) {
            newY = newY * -1
        }
    }
    //------- 
    if (startZ < -zlimit) {
        if (newZ < 0) {
            newZ = 0
        }
    }
    else if (startZ > zlimit) {
        if (newZ > 0) {
            newZ = 0
        }
    }

    // we want z to move with x
    // it should be a fraction of the velocity assigned for z maybe?
    // 

    current_velocity = createVector(newX, newY, newZ)
    visualizer.sphere_velocity = current_velocity

    currentPosition.add(current_velocity)
    // console.log(currentPosition)
    // currentPosition.x is the new center_vertical_sphere
    // currentPosition.y is the new center_vertical_sphere
    visualizer.center_vertical_sphere = currentPosition.x
    visualizer.center_horizontal_sphere = currentPosition.y
    visualizer.center_z_sphere = currentPosition.z
}

// this just updates the velocity when an onBeat is detected, ya dummy
updateSphereVelocity = (micLevel) => {
    // get the current velocity so we know what direction we're going in
    // if the values are negative we want the new ones to be negative too
    var old_velocity = visualizer.sphere_velocity

    // var noiseValueX = map(noise(micLevel) * 5, -3, 3, 0, 1)
    // var noiseValueY = map(noise(micLevel) * 2, -3, 3, 0, 1)

    var noiseValueX = noise(micLevel) * 5
    var noiseValueY = noise(micLevel) * 2
    // print('noisevalueX', noiseValueX)

    // var noiseValueZ = noise(micLevel)
    var noiseValueZ = noiseValueX / 3

    let newX = noiseValueX * 1
    let newY = noiseValueY * 1
    let newZ = noiseValueZ * 1

    if (old_velocity.x < 0){
        newX = noiseValueX * -1
    } 
    if (old_velocity.y < 0){
        newY = noiseValueY * -1
    }
    if (old_velocity.z < 0){
        newZ = noiseValueZ * -1
    }
    // console.log('newx', newX)
    visualizer.sphere_velocity = createVector(newX, newY, newZ)
}


moveSphereCenter = (micLevel) => {
    var noiseValue = noise(micLevel * (visualizer.counter % 2)) * 5
    var scalar = 3;  // set the radius of circle
    var startX = visualizer.center_vertical_sphere;	// set the x-coordinate for the circle center
    var startY = visualizer.center_horizontal_sphere;	// set the y-coordinate for the circle center

    // how do we say ok after x times turn right
    // tbh it could be left or right if its in center
    // could be a matrix? like tic tac toe

    var down = (startX + noiseValue);
    var up = (startX - noiseValue);
    var left = (startY - noiseValue);
    var right = (startY + noiseValue);
    var limit = 400
    if (startX < -limit) {
        visualizer.center_vertical_sphere = up
    }
    if (startX > limit){
        visualizer.center_vertical_sphere = down
    }
    if (startX > -limit && startX < limit){
        // flip a coin man
        var r = random(-1, 1);
        if (r<0) {
            visualizer.center_vertical_sphere = up
        }
        else if (r>0) {
            visualizer.center_vertical_sphere = down
        }
    }
    if (startY < -limit) {
        visualizer.center_horizontal_sphere = right
    }
    if (startY > limit) {
        visualizer.center_horizontal_sphere = left
    }
    if (startY > -limit && startY < limit){
        // flip a coin man
        var r = random(-1, 1);
        if (r<0) {
            visualizer.center_horizontal_sphere = right
        }
        else if (r>0) {
            visualizer.center_horizontal_sphere = left
        }
    }

}

moveCenter = (micLevel) => {
    var noiseValue = noise(micLevel * (visualizer.counter % 2)) * 5
    var scalar = 3;  // set the radius of circle
    var startX = visualizer.center_vertical;	// set the x-coordinate for the circle center
    var startY = visualizer.center_horizontal;	// set the y-coordinate for the circle center

    // how do we say ok after x times turn right
    // tbh it could be left or right if its in center
    // could be a matrix? like tic tac toe

    var down = (startX + noiseValue);
    var up = (startX - noiseValue);
    var left = (startY - noiseValue);
    var right = (startY + noiseValue);
    var limit = 400
    if (startX < -limit) {
        visualizer.center_vertical = up
    }
    if (startX > limit){
        visualizer.center_vertical = down
    }
    if (startX > -limit && startX < limit){
        // flip a coin man
        var r = random(-1, 1);
        if (r<0) {
            visualizer.center_vertical = up
        }
        else if (r>0) {
            visualizer.center_vertical = down
        }
    }
    if (startY < -limit) {
        visualizer.center_horizontal = right
    }
    if (startY > limit) {
        visualizer.center_horizontal = left
    }
    if (startY > -limit && startY < limit){
        // flip a coin man
        var r = random(-1, 1);
        if (r<0) {
            visualizer.center_horizontal = right
        }
        else if (r>0) {
            visualizer.center_horizontal = left
        }
    }


    // visualizer.center_vertical = x
    // visualizer.center_horizontal = y
}

const getRotatedImage = (sourceImage, provideImage) => {
    var cv    = document.createElement('canvas');
    cv.width  = sourceImage.height;
    cv.height = sourceImage.width;
    var ctx   = cv.getContext('2d');
    ctx.translate(cv.width/2, cv.height/2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(sourceImage, -cv.width/2, -cv.height/2);
   if (provideImage) {
       var img=new Image();
       img.src= cv.toDataURL();
       return img;
   } else
       return cv;
 }

const getOutline = function( img ) {
    const WHITE = [255, 255, 255];
    let contours = img.contours();
    let largestContourImg;
    let largestArea = 0;
    let largestAreaIndex;

    for (let i = 0; i < contours.size(); i++) {
        if (contours.area(i) > largestArea) {
        largestArea = contours.area(i);
        largestAreaIndex = i;
        }
    }

    largestContourImg.drawContour(contours, largestAreaIndex, GREEN, thickness, lineType);
}

setup = () => {
    windowResized()
    noLoop()
    visualizer = new Visualizer();
    noiseSeed(visualizer.center_vertical)
    let cnv = createCanvas(windowWidth, windowHeight, WEBGL);
    // let cnv = createCanvas(windowWidth, windowHeight);
    cnv.mousePressed(userStartAudio);
    // cnv.mousePressed(getCache)

    // =================================
    // // rainbow cycle / rgb_to_hsb shader
    // --------------------------------- 
    // // initialize the createGraphics layers
    // shaderTexture = createGraphics(640, 480, WEBGL);

    // // turn off the createGraphics layers stroke
    // shaderTexture.noStroke();
    // ========================

    // =================================
    // // video_feeback shader
    // --------------------------------- 
    // this layer will use webgl with our shader
    shaderLayer = createGraphics(windowWidth, windowHeight, WEBGL);

    // this layer will just be a copy of what we just did with the shader
    copyLayer = createGraphics(windowWidth, windowHeight);
    // ========================

    mic = new p5.AudioIn();
    mic.start()
    mic.getSources().then(devices => {
        mic.setSource(0);
        mic.start()
    })
    console.log('mic', mic)

    let constraints = {
        video: {
            deviceId: videoDeviceId,
            optional: [{ maxFrameRate: 10 }]
        },
        audio: false
    };
    vid = createCapture(VIDEO)
    vid.size(windowWidth, windowHeight);
    
    let outline = null
    // if (vid) {
        // debugger
        // outline = getOutline(vid)
        // vid.hide()
    // }

    vid.hide()
    textAlign(CENTER);

    fft = new p5.FFT();
    fft.setInput(mic)

    amplitude = new p5.Amplitude()
    amplitude.setInput(mic)
    amplitude.smooth(0.9);
}

draw = () => {
    new_width = width * 2;
    new_height = height * 2;
    let counter_max = 10000;
    let micLevel;
    let level;

    // console.log('fillOn', fillOn)
    // console.log('again')

    background(0)
    if (startAudio) {
        mic.start();
        audioStarted = true;
        startAudio = false;
    } 

    if (audioStarted) {
        micLevel = mic.getLevel();
        // print('miclevel', micLevel)
        level = amplitude.getLevel();
        detectBeat(level, micLevel);
    } else {     
        fill(255);   
        text('tap to start', width/2, height /2);
    }
    // console.log(micLevel)
    // translate for WEBGL
    translate(-width, -height)

    // translate for non-WEBGL
    // translate(-width/2, -height/2)

    // =================================
    // // 2d camera capture draw
    // ---------------------------------
    // push();
    // if (capture && capture.width) {
    //     image(capture, (width/2), (height/2), 640, 480)
    //     filter(THRESHOLD)
    // }
    // pop();
    // =================================

    visualizer.counter += 1

    if (visualizer.counter >= counter_max) {
        visualizer.counter = 1;
    }

    // let spectrum = fft.analyze();
    // let energy = fft.getEnergy('bass', "treble")

    // TOGGLE FOR COLOR FILL
    // TURN COLOR BACKGROUND ON OFF
    // 0 = Off
    // 1 = On
    
    
    noStroke();
    // fill(energy);

    // kind of greeny?
    // fill(100, rect_color_offset, 50);

    // rainbow cylce
    // r,g,b are defined globally so don't need to return from func

    // ok we only trigger an increment (`x`) of `raindbowCylce()` n times where n == increment (`x`)
    // trigger is on the beat
    // trigger when beat detection ?\\\\\\\\\\\\\
    rainbowCycle()
    fill(r, g, b)

    // for (let i = 0; i< spectrum.length; i++){
    //     // bottom
    //     let x = map(i, 0, spectrum.length, 0, width*2);
    //     let neg_x = map(i, 0, spectrum.length, width*2, 0);
    //     let h = -height/1.5 + map(spectrum[i], 0, 255, height, 0);
    //     let neg_h = height/1.5 + map(spectrum[i], 0, 255, 0, height);

    //     rect(x, height*1.5, width / spectrum.length, h )
    //     rect(neg_x, height*1.5, width / spectrum.length, h )

    //     // top
    //     rect(x, height * -0.50, width / spectrum.length, height - h )
    //     rect(neg_x, height * -0.50, width / spectrum.length, height - h )
    //     // rect(neg_x, height*1.5, width / spectrum.length, neg_h )

    //     // left
    //     // let hy = map(i, 0, spectrum.length, 0, height);
    //     // let hneg_x = map(i, 0, spectrum.length, height*2, 0);
    //     // let hh = -width/1.5 + map(spectrum[i], 0, 255, width, 0);
    //     // rect(0, hy, width / spectrum.length, hh )
    //     // rect(hneg_x, height*1.5, width / spectrum.length, hh )
    // }


    // ================================
    // ================================
    let adjusted_height = (new_height/2) + (visualizer.center_vertical)
    let adjusted_width = ((new_width/2) + (visualizer.center_horizontal))
    // ================================
    // ================================


// all drawing function below this line
// ================================// ================================// ================================// ================================

    if (rectangle_video) {


        push()
        // welp how can we have this guy move in and out?
        // translate on the z axis?
        // set an x, y, z limit
        // move in a direction until it hits one of those limits, then 'bounce' back in the other direction

        noStroke()
        // background(0.5)
        // stroke(r, g, b, 100)
        // strokeWeight(1.5)
        // stroke(`rgba(${r}, ${g}, ${b}, 1.5)`)
        // fill(255, 255, 255, 90)

        var adjustedSphereHeight = adjusted_height - 10;
        translate(adjusted_width, adjusted_height)

        // =====================
        // set 'v' for 3d movement of sphere
        // --------------------------------- 
        // let v = p5.Vector.fromAngle(t, 50)
        // let v = p5.Vector.fromAngles(t * 1.0, t * 1.3, 100)
        // console.log(v)
        // translate(v);
        // ====================
        var t = millis() / 3000
        // rotateY(180)
        // rotateZ(t/2)
        rotate(t/2)

        // directionalLight(255, 255, 255, 0, 0, -1);

        if (vid && vid.width && camShader) {
            // for 3D/WEBGL
            // https://github.com/aferriss/p5jsShaderExamples

            // =================================
            // rainbow cycle / rgb_to_hsb shader
            // --------------------------------- 
            // // instead of just setting the active shader we are passing it to the createGraphics layer
            // shaderTexture.shader(camShader);
            // // here we're using setUniform() to send our uniform values to the shader
            // camShader.setUniform('tex0', vid);
            // camShader.setUniform('time', frameCount * 0.01);
            // // passing the shaderTexture layer geometry to render on
            // shaderTexture.rect(0,0,width,height);
            // // pass the shader as a texture
            // texture(shaderTexture);
            // =================================

            // =================================
            // video_feedback shader
            // --------------------------------- 
            // shader() sets the active shader with our shader
            shaderLayer.shader(camShader);

            // lets just send the cam to our shader as a uniform
            camShader.setUniform('tex0', vid);

            // also send the copy layer to the shader as a uniform
            camShader.setUniform('tex1', copyLayer);

            // send mouseDown to the shader as a int (either 0 or 1)
            // everytime the counter is divisible by 100 lets reset the feedback
            if (visualizer.counter % 50 == 0) {
                camShader.setUniform('mouseDown', 1);
            }
            else {
                // lets also allow clicking to reset the feedback
                camShader.setUniform('mouseDown', int(mouseIsPressed));
            }

            camShader.setUniform('time', frameCount * 0.01);

            // rect gives us some geometry on the screen
            shaderLayer.rect(0, 0, width, height);

            // draw the shaderlayer into the copy layer
            copyLayer.image(shaderLayer, 0, 0, width, height);
            
            // save the image
            // during the init ...
            // var rotatedImage=getRotatedImage(myImage);
            // print(rotatedImage)
            // ... later ...
            // ctx.drawImage(rotatedImage, ... , ...);

            // pass the shader as a texture
            texture(shaderLayer)
            // =================================
            // console.log('miclevel*10', micLevel * 10) 
            // var color_offset = map(r.counter, 0, (new_width - 100), 150, 255)
            // sphereMicLevel = map(round(micLevel * 100, 3), 0.000, 1.000, 0.80, 1.35)
            sphere(50, 16, 16);
            // print('do the rect')
            // rect(0, 0, 305, 305)
        }

        pop()
    }


    // ================================
    // moving center start
    // ================================
    if (movingCenter) {
        if (visualizer.counter % 20 == 0) {
            moveCenter(micLevel)
        }
    }
    // ================================
    // moving center stop
    // ================================

    if (movingSphereSmooth) {
        if (visualizer.counter % 5 == 0) {
            moveSphereSmooth()
        }
    }



    // ================================
    // metronome boxes start
    // ================================
    if (metronomeBoxes) {
        // if counter is divisible by 50 add a rect
        if (visualizer.counter % 20 == 0) {
            addRect(micLevel)
        }
    }
    // ================================
    // metronome boxes stop
    // ================================

    // ================================
    // just lines start
    // ================================
    if (justLines) {
        if (audioStarted) {
            // don't show lines until audio/loop is started
            push()
            center_square_size = 5
            // "hallway" lines
            // fill(0, 0, 0, 0)
            // stroke(200, 0, rect_color_offset, 90)
            stroke(r, g, b, 90)
            strokeWeight(1)
            fill(200, 0, rect_color_offset, 80 * fillOn)

            // left
            beginShape()
            vertex(1, 1)
            vertex(adjusted_width - (aspect_ratio * center_square_size) , adjusted_height - center_square_size)
            vertex(adjusted_width - (aspect_ratio * center_square_size), adjusted_height + center_square_size)
            vertex(1, new_height)
            endShape(CLOSE)

            // right
            beginShape()
            vertex(new_width, new_height)
            vertex(adjusted_width + (aspect_ratio * center_square_size), adjusted_height + center_square_size)
            vertex(adjusted_width + (aspect_ratio * center_square_size), adjusted_height - center_square_size)
            vertex(new_width, 1)
            endShape(CLOSE)

            // top
            beginShape()
            vertex(1, 1)
            vertex(adjusted_width - (aspect_ratio * center_square_size) , adjusted_height - center_square_size)
            vertex(adjusted_width + (aspect_ratio * center_square_size), adjusted_height - center_square_size)
            vertex(new_width, 1)
            endShape(CLOSE)

            // bottom
            beginShape()
            vertex(1, new_height)
            vertex(adjusted_width - (aspect_ratio * center_square_size), adjusted_height + center_square_size)
            vertex(adjusted_width + (aspect_ratio * center_square_size), adjusted_height + center_square_size)
            vertex(new_width, new_height)
            endShape(CLOSE)


            // stroke(200, 0, rect_color_offset, 90)
            beginShape()
            vertex(adjusted_width - (aspect_ratio * center_square_size), adjusted_height - center_square_size)
            vertex(adjusted_width + (aspect_ratio * center_square_size), adjusted_height - center_square_size)
            endShape(CLOSE)

            beginShape()
            vertex(adjusted_width + (aspect_ratio * center_square_size), adjusted_height + center_square_size)
            vertex(adjusted_width - (aspect_ratio * center_square_size), adjusted_height + center_square_size)
            endShape(CLOSE)

            // fill in the middle square
            beginShape()
            vertex(adjusted_width - (aspect_ratio * center_square_size), adjusted_height - center_square_size)
            vertex(adjusted_width - (aspect_ratio * center_square_size), adjusted_height + center_square_size)
            vertex(adjusted_width + (aspect_ratio * center_square_size), adjusted_height + center_square_size)
            vertex(adjusted_width + (aspect_ratio * center_square_size), adjusted_height - center_square_size)
            endShape(CLOSE)

            pop()
            // light coming from the middle square
            // directionalLight(255, 255, 255, adjusted_width, adjusted_height);
        }
    }
    // ================================
    // just lines stop
    // ================================

    // ================================
    // lines and walls start
    // ================================
    if (linesAndWalls) {

        if (audioStarted) {
            // don't show lines until audio/loop is started
            push()
            center_square_size = 5
            // "hallway" lines
            // fill(0, 0, 0, 0)
            stroke(200, 0, rect_color_offset, 90)
            // stroke(r, g, b, 90)
            strokeWeight(3)
            fill(200, 0, rect_color_offset, 80 * fillOn)

            // left
            beginShape()
            vertex(1, 1)
            vertex(adjusted_width - (aspect_ratio * center_square_size) , adjusted_height - center_square_size)
            vertex(adjusted_width - (aspect_ratio * center_square_size), adjusted_height + center_square_size)
            vertex(1, new_height)
            endShape(CLOSE)

            // right
            beginShape()
            vertex(new_width, new_height)
            vertex(adjusted_width + (aspect_ratio * center_square_size), adjusted_height + center_square_size)
            vertex(adjusted_width + (aspect_ratio * center_square_size), adjusted_height - center_square_size)
            vertex(new_width, 1)
            endShape(CLOSE)

            fill(200, 0, rect_color_offset, 65 * fillOn)
            // top
            beginShape()
            vertex(1, 1)
            vertex(adjusted_width - (aspect_ratio * center_square_size) , adjusted_height - center_square_size)
            vertex(adjusted_width + (aspect_ratio * center_square_size), adjusted_height - center_square_size)
            vertex(new_width, 1)
            endShape(CLOSE)

            fill(r, g, b, 50 * fillOn)
            // bottom
            beginShape()
            vertex(1, new_height)
            vertex(adjusted_width - (aspect_ratio * center_square_size), adjusted_height + center_square_size)
            vertex(adjusted_width + (aspect_ratio * center_square_size), adjusted_height + center_square_size)
            vertex(new_width, new_height)
            endShape(CLOSE)

            stroke(200, 0, rect_color_offset, 90)
            beginShape()
            vertex(adjusted_width - (aspect_ratio * center_square_size), adjusted_height - center_square_size)
            vertex(adjusted_width + (aspect_ratio * center_square_size), adjusted_height - center_square_size)
            endShape(CLOSE)

            beginShape()
            vertex(adjusted_width + (aspect_ratio * center_square_size), adjusted_height + center_square_size)
            vertex(adjusted_width - (aspect_ratio * center_square_size), adjusted_height + center_square_size)
            endShape(CLOSE)

            // fill in the middle square
            fill(r, g, b, 70 * fillOn)
            beginShape()
            vertex(adjusted_width - (aspect_ratio * center_square_size), adjusted_height - center_square_size)
            vertex(adjusted_width - (aspect_ratio * center_square_size), adjusted_height + center_square_size)
            vertex(adjusted_width + (aspect_ratio * center_square_size), adjusted_height + center_square_size)
            vertex(adjusted_width + (aspect_ratio * center_square_size), adjusted_height - center_square_size)
            endShape(CLOSE)


            // light coming from the middle square
            // directionalLight(255, 255, 255, adjusted_width, adjusted_height+50);
            pop()
        }
    }
    // ================================
    // lines and walls stop
    // ================================

    // ================================
    // just walls stop
    // ================================

    if (justWalls) {

        if (audioStarted) {
            // don't show lines until audio/loop is started
            push()
            center_square_size = 5
            noStroke()
            // "hallway" lines
            // fill(0, 0, 0, 0)
            // stroke(200, 0, rect_color_offset, 90)
            // stroke(r, g, b, 90)
            // strokeWeight(3)
            fill(200, 0, rect_color_offset, 80 * fillOn)

            // left
            beginShape()
            vertex(1, 1)
            vertex(adjusted_width - (aspect_ratio * center_square_size) , adjusted_height - center_square_size)
            vertex(adjusted_width - (aspect_ratio * center_square_size), adjusted_height + center_square_size)
            vertex(1, new_height)
            endShape(CLOSE)

            // right
            beginShape()
            vertex(new_width, new_height)
            vertex(adjusted_width + (aspect_ratio * center_square_size), adjusted_height + center_square_size)
            vertex(adjusted_width + (aspect_ratio * center_square_size), adjusted_height - center_square_size)
            vertex(new_width, 1)
            endShape(CLOSE)

            fill(200, 0, rect_color_offset, 65 * fillOn)
            // top
            beginShape()
            vertex(1, 1)
            vertex(adjusted_width - (aspect_ratio * center_square_size) , adjusted_height - center_square_size)
            vertex(adjusted_width + (aspect_ratio * center_square_size), adjusted_height - center_square_size)
            vertex(new_width, 1)
            endShape(CLOSE)

            fill(r, g, b, 50 * fillOn)
            // bottom
            beginShape()
            vertex(1, new_height)
            vertex(adjusted_width - (aspect_ratio * center_square_size), adjusted_height + center_square_size)
            vertex(adjusted_width + (aspect_ratio * center_square_size), adjusted_height + center_square_size)
            vertex(new_width, new_height)
            endShape(CLOSE)

            stroke(200, 0, rect_color_offset, 90)
            beginShape()
            vertex(adjusted_width - (aspect_ratio * center_square_size), adjusted_height - center_square_size)
            vertex(adjusted_width + (aspect_ratio * center_square_size), adjusted_height - center_square_size)
            endShape(CLOSE)

            beginShape()
            vertex(adjusted_width + (aspect_ratio * center_square_size), adjusted_height + center_square_size)
            vertex(adjusted_width - (aspect_ratio * center_square_size), adjusted_height + center_square_size)
            endShape(CLOSE)

            // fill in the middle square
            fill(r, g, b, 70 * fillOn)
            beginShape()
            vertex(adjusted_width - (aspect_ratio * center_square_size), adjusted_height - center_square_size)
            vertex(adjusted_width - (aspect_ratio * center_square_size), adjusted_height + center_square_size)
            vertex(adjusted_width + (aspect_ratio * center_square_size), adjusted_height + center_square_size)
            vertex(adjusted_width + (aspect_ratio * center_square_size), adjusted_height - center_square_size)
            endShape(CLOSE)

            pop()
            // light coming from the middle square
            // directionalLight(255, 255, 255, adjusted_width, adjusted_height+50);
        }
    }
    // ================================
    // just walls stop
    // ================================


    // ================================
    // sphere stuff in the middle start
    // ================================

    if (middleSphere) {
        if (lockCenters) {
            var adjusted_height_sphere = (new_height/2) + (visualizer.center_vertical)
            var adjusted_width_sphere = ((new_width/2) + (visualizer.center_horizontal))
        }

        else {
            var adjusted_height_sphere = (new_height/2) + (visualizer.center_vertical_sphere)
            var adjusted_width_sphere = ((new_width/2) + (visualizer.center_horizontal_sphere))
        }

        var t = millis() / 3000
        push()        
            noStroke()

            var adjustedSphereHeight =  adjusted_height_sphere - 10;
            translate(adjusted_width_sphere, adjustedSphereHeight, visualizer.center_z_sphere)
        
            // =====================
            // set 'v' for 3d movement of sphere
            // --------------------------------- 
            // let v = p5.Vector.fromAngle(t, 50)
            // let v = p5.Vector.fromAngles(t * 1.0, t * 1.3, 100)
            // console.log(v)
            // translate(v);
            // ====================
            
            // rotateY(180)
            rotateY(-t/2)

            directionalLight(255, 255, 255, 0, 0, -1);

            if (vid && vid.width && camShader) {
                // for 3D/WEBGL
                // https://github.com/aferriss/p5jsShaderExamples

                // =================================
                // rainbow cycle / rgb_to_hsb shader
                // --------------------------------- 
                // // instead of just setting the active shader we are passing it to the createGraphics layer
                // shaderTexture.shader(camShader);
                // // here we're using setUniform() to send our uniform values to the shader
                // camShader.setUniform('tex0', vid);
                // camShader.setUniform('time', frameCount * 0.01);
                // // passing the shaderTexture layer geometry to render on
                // shaderTexture.rect(0,0,width,height);
                // // pass the shader as a texture
                // texture(shaderTexture);
                // =================================

                // =================================
                // video_feedback shader
                // --------------------------------- 
                // shader() sets the active shader with our shader
                shaderLayer.shader(camShader);

                // lets just send the cam to our shader as a uniform
                camShader.setUniform('tex0', vid);

                // also send the copy layer to the shader as a uniform
                camShader.setUniform('tex1', copyLayer);
        
                // send mouseDown to the shader as a int (either 0 or 1)
                // everytime the counter is divisible by 100 lets reset the feedback
                if (visualizer.counter % 50 == 0) {
                    camShader.setUniform('mouseDown', 1);
                }
                else {
                    // lets also allow clicking to reset the feedback
                    camShader.setUniform('mouseDown', int(mouseIsPressed));
                }

                camShader.setUniform('time', frameCount * 0.01);

                // rect gives us some geometry on the screen
                shaderLayer.rect(0, 0, width, height);

                // draw the shaderlayer into the copy layer
                copyLayer.image(shaderLayer, 0, 0, width, height);
                // pass the shader as a texture
                texture(shaderLayer)
                // =================================
                // console.log('miclevel*10', micLevel * 10) 
                // var color_offset = map(r.counter, 0, (new_width - 100), 150, 255)
                // sphereMicLevel = map(round(micLevel * 100, 3), 0.000, 1.000, 0.80, 1.35)
                sphere(50, 16, 16);
            }

        pop()

                
        push()
            noFill()
            translate(adjusted_width_sphere, adjustedSphereHeight, visualizer.center_z_sphere)
            rotateY(t/2)     
            strokeWeight(1.5)
            stroke(`rgba(${r}, ${g}, ${b}, 1.5)`)
            sphere(53, 16, 16);
        pop()

        // light coming from the middle square
        // directionalLight(250, 250, 250, -adjusted_width, -adjusted_height, -1);
    }
    // ================================
    // sphere stuff in the middle end
    // ================================

    // list of speheres
    // loop through list
    //  draw each one
    //  move and rotate
    
    // visualizer.sphere_list.forEach((s, index) => {
    //     if (((new_width / 1) - s.counter) < 1 ) {
    //         visualizer.sphere_list.splice(index, 1)
    //     }

    //     var sub_value = map(s.counter, 0, new_width, 0.1, (1 * visualizer.speed))
    //     s.counter += sub_value + (0.05 * s.counter)
    //     s.radius = s.counter

    //     push()
    //     stroke(r, g, b, 100)
    //     // noStroke();
    //     translate(adjusted_width, adjusted_height)
    //     // directionalLight(255, 255, 255, 0, 0, -1);
    //     rotateY(millis() / 1000)
    //     sphere(s.radius, 16,16);
    //     pop()
    // })



    // ===============================
    visualizer.rect_list.forEach((r, index) => {
        if (((new_width / 1) - r.counter) < 1 ) {
            visualizer.rect_list.splice(index, 1)
        }

        var nw = (new_width / 2) + r.center_horizontal
        var nh = (new_height / 2) + r.center_vertical
        var color_offset = map(r.counter, 0, (new_width - 100), 150, 255)
        // var color_offset = map(micLevel * 4, 0, (new_width - 100), 100, 255)


        // var color_offset = map(r.counter, 0, counter_max, 0, 255)
        // fill(r.cfill, color_offset * 2, r.cfill, 255)
        // fill(visualizer.color_adjust, r.cfill, color_offset, 255)
        // fill(0, visualizer.color_adjust/2, visualizer.color_adjust, 255)
        

        if (r.counter < 4) {
            r.first = true;
        }
        else {
            r.first = false;
        }

        var sub_value = map(r.counter, 0, new_width, 0.1, (10 * visualizer.speed))
        r.counter += sub_value + (0.05 * r.counter)

        if (r.first) {
            fill(color_offset, 0, r.cfill, fillOn)
        }
        else {
            fill('rgba(0,0,0,0)')
        }
        
        // stroke(color_offset, 0, visualizer.color_adjust)
        stroke(color_offset, 0, r.cfill)
        strokeWeight(map(r.counter, 0, 150, 0, 10))

        // console.log('(nw + r.counter * aspect_ratio) + 25',(nw + r.counter * aspect_ratio) + 25)
        // console.log('(nh + (r.counter * 1)) + 25', (nh + (r.counter * 1)) + 25)
        beginShape()
        // draw rect with aspect ratio calculation
        vertex(nw + r.counter * aspect_ratio, nh + (r.counter * 1))
        vertex(nw + r.counter * aspect_ratio, nh - (r.counter * 1))
        vertex(nw - r.counter * aspect_ratio, nh - (r.counter * 1))
        vertex(nw - r.counter * aspect_ratio, nh + (r.counter * 1))
        
        // vertex((nw + r.counter * aspect_ratio) + 25, (nh + (r.counter * 1)) + 25)
        // vertex((nw + r.counter * aspect_ratio) +25, (nh - (r.counter * 1)) - 25)
        // vertex((nw - r.counter * aspect_ratio) -25, (nh - (r.counter * 1)) - 25)
        // vertex((nw - r.counter * aspect_ratio) -25, (nh + (r.counter * 1)) + 25)
        
        // vertex((nw + r.counter * aspect_ratio) + 25, (nh + (r.counter * 1)) + 25)
        // vertex((nw + r.counter * aspect_ratio) +25, (nh - (r.counter * 1)) - 25)
        // vertex((nw - r.counter * aspect_ratio) -25, (nh - (r.counter * 1)) - 25)
        // vertex((nw - r.counter * aspect_ratio) -25, (nh + (r.counter * 1)) + 25)
        // debugger
        endShape(CLOSE)
    }) 

    
} 
