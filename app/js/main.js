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
        this.center_vertical = 0
        this.center_horizontal = 0
        this.purge = 0
        this.lines = 0
        this.cfill = 0
        this.rect_list = []
        this.beat_counter = 0
        this.section_counter = 0
        this.segment_counter = 0
        this.global_bool = {'odd': true, 'even': true}
        this.color_adjust = 0
    }
}

class RectObj {
    constructor(width, height, center_vertical=0, center_horizontal=0, cfill=0) {
        this.counter = 0
        this.width = width
        this.height = height
        this.center_vertical = center_vertical
        this.center_horizontal = center_horizontal
        this.cfill = cfill
    }
}

const visualizer = new Visualizer();
let videoDeviceId;
let audioDeviceId;
let capture;
let startAudio = false;
let audioStarted = false;

// the shader variable
let camShader;
var mic;
let fft;


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

setVideoSource = () => {
    var videoSelect = document.getElementById('videoSourceSelect');
    videoDeviceId = videoSelect.value
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

    let constraints = {
        video: {
            deviceId: videoDeviceId,
            optional: [{ maxFrameRate: 10 }]
        },
        audio: false
    }

    // capture = createCapture(constraints);
    // capture.size(width/2, height/2)
    // capture.size(640, 480)
    // capture.hide();

    startAudio = true;
    loop();
}

// preload = () => {
    
  // load the shader
//   camShader = loadShader('../../shaders/sinewave_distortion/effect.vert', '../shaders/sinewave_distortion/effect.frag');
// }



detectBeat = (level, micLevel) => {
    if (level  > beatCutoff && level > beatThreshold){
        onBeat(micLevel);
        beatCutoff = level *1.2;
        framesSinceLastBeat = 0;
    } else{
        if (framesSinceLastBeat <= beatHoldFrames){
            framesSinceLastBeat ++;
        }
        else{
            beatCutoff *= beatDecayRate;
            beatCutoff = Math.max(beatCutoff, beatThreshold);
        }
    }
}
  
onBeat = (micLevel) => {
    addRect(micLevel)
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

setup = () => {
    windowResized()
    noLoop()
    // let cnv = createCanvas(1440, 900, WEBGL);
    // let cnv = createCanvas(1440, 900);
    let cnv = createCanvas(windowWidth, windowHeight);
    cnv.mousePressed(userStartAudio);

    mic = new p5.AudioIn();
    mic.start()
    mic.getSources().then(devices => {
        mic.setSource(0);
        mic.start()
    })
    console.log('mic', mic)
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
    var micLevel = 0;
    var level = 0;
    background(0)
    if (startAudio) {
        mic.start();
        audioStarted = true;
        startAudio = false;
    } 

    if (audioStarted) {
        micLevel = mic.getLevel();
        level = amplitude.getLevel();
        detectBeat(level, micLevel);
    } else {     
        fill(255);   
        text('tap to start', width/2, height /2);
    }
    // let micLevel = mic.getLevel();
    // console.log(micLevel)

    // push();
    // if (capture && capture.width) {
    //     // for 3D/WEBGL
    //     // https://github.com/aferriss/p5jsShaderExamples
    //     // shader() sets the active shader with our shader
    //     shader(camShader);

    //     // lets just send the cam to our shader as a uniform
    //     camShader.setUniform('tex0', capture);

    //     // send a slow frameCount to the shader as a time variable
    //     camShader.setUniform('time', frameCount * 0.01);

    //     // lets map the mouseX to frequency and mouseY to amplitude
    //     // try playing with these to get a more or less distorted effect
    //     // 10 and 0.25 are just magic numbers that I thought looked good
    //     // let freq = 10;
    //     // let amp = 0.25;
    //     let freq = map(mouseX, 0, width, 0, 10.0);
    //     let amp = map(mouseY, 0, height, 0, 0.25);

    //     // send the two values to the shader
    //     camShader.setUniform('frequency', freq);
    //     camShader.setUniform('amplitude', amp);
        
        // for 2D
    //     image(capture, (width/2) - 310, (height/2) - 240, 640, 480)

    //     filter(THRESHOLD)
    //     // filter(INVERT);
    // }
    // pop();

    // push();
    // if (capture && capture.width) {
    //     image(capture, (width/2) - 310, (height/2) - 240, 640, 480)
    //     filter(THRESHOLD)
    // }
    // pop();

    visualizer.counter += 1

    // translate for WEBGL
    // translate(-width, -height)

    // translate for non-WEBGL
    translate(-width/2, -height/2)


    if (visualizer.counter >= counter_max) {
        visualizer.counter = 1;
    }

    // if (visualizer.counter % 10 == 0) {
    //     let cv = (visualizer.center_vertical * 10)
    //     let ch = (visualizer.center_horizontal * 10)
    //     let rect_color_offset = map(micLevel, 0, 0.25, 50, 255)
    //     var rect_obj = new RectObj(
    //         new_width, new_height,
    //         center_vertical=cv, center_horizontal=ch,
    //         cfill=rect_color_offset)
    //         // cfill=visualizer.color_adjust)
    //     visualizer.rect_list.push(rect_obj)
    //     visualizer.beat_counter += 1
    // }
    // else {
    //     console.log('whats the counter then', visualizer.counter)
    // }

    let spectrum = fft.analyze();
    let energy = fft.getEnergy('bass', "treble")
    noStroke();
    fill(energy);

    for (let i = 0; i< spectrum.length; i++){
        // bottom
        let x = map(i, 0, spectrum.length, 0, width*2);
        let neg_x = map(i, 0, spectrum.length, width*2, 0);
        let h = -height/1.5 + map(spectrum[i], 0, 255, height, 0);
        let neg_h = height/1.5 + map(spectrum[i], 0, 255, 0, height);
        // stroke('brown')
        rect(x, height*1.5, width / spectrum.length, h )
        rect(neg_x, height*1.5, width / spectrum.length, h )

        // top
        rect(x, height * -0.50, width / spectrum.length, height - h )
        rect(neg_x, height * -0.50, width / spectrum.length, height - h )
        // rect(neg_x, height*1.5, width / spectrum.length, neg_h )

        // left
        // let hy = map(i, 0, spectrum.length, 0, height);
        // let hneg_x = map(i, 0, spectrum.length, height*2, 0);
        // let hh = -width/1.5 + map(spectrum[i], 0, 255, width, 0);
        // rect(0, hy, width / spectrum.length, hh )
        // rect(hneg_x, height*1.5, width / spectrum.length, hh )
    }

    let adjusted_height = (new_height/2) + (visualizer.center_vertical * 10)
    let adjusted_width = (new_width/2) + (visualizer.center_horizontal * 10)

    // let color_offset = map(micLevel, 0, 0.25, 50, 255)

    // "hallway" lines
    fill(0, 0, 0, 0)
    stroke(200, 0, rect_color_offset, 90)
    strokeWeight(3)

    beginShape()
    vertex(1 + 1, 1 + 1)
    vertex(adjusted_width + 1, adjusted_height + 1)
    vertex(adjusted_width + 1, adjusted_height - 1)
    vertex(1 + 1, new_height - 1)
    endShape(CLOSE)

    beginShape()
    vertex(new_width - 1, new_height - 1)
    vertex(adjusted_width - 1, adjusted_height - 1)
    vertex(adjusted_width - 1, adjusted_height + 1)
    vertex(new_width - 1, 1 + 1)
    endShape(CLOSE)

    // console.log(color_offset)
    // ===============================
    visualizer.rect_list.forEach((r, index) => {
        if (((new_width / 1) - r.counter) < 1 ) {
            visualizer.rect_list.splice(index, 1)
        }

        var sub_value = map(r.counter, 0, new_width, 0.1, (10 * visualizer.speed))
        r.counter += sub_value + (0.05 * r.counter)
        var nw = (new_width / 2) + r.center_horizontal
        var nh = (new_height / 2) + r.center_vertical
        if (index ==1) {
            // console.log(r.counter)
        }
        var color_offset = map(r.counter, 0, (new_width - 100), 150, 255)
        // var color_offset = map(micLevel * 4, 0, (new_width - 100), 100, 255)


        // var color_offset = map(r.counter, 0, counter_max, 0, 255)
        // fill(r.cfill, color_offset * 2, r.cfill, 255)
        // fill(visualizer.color_adjust, r.cfill, color_offset, 255)
        // fill(0, visualizer.color_adjust/2, visualizer.color_adjust, 255)
        fill('rgba(0,0,0,0)')
        // stroke(color_offset, 0, visualizer.color_adjust)
        stroke(color_offset, 0, r.cfill)
        strokeWeight(map(r.counter, 0, 150, 0, 10))
        beginShape()
        // 16:9 (monitor)
        // vertex(nw + r.counter * 2, nh + (r.counter * 1.125))
        // vertex(nw + r.counter * 2, nh - (r.counter * 1.125))
        // vertex(nw - r.counter * 2, nh - (r.counter * 1.125))
        // vertex(nw - r.counter * 2, nh + (r.counter * 1.125))

        // 16:10 (laptop)
        // vertex(nw + r.counter * 2, nh + (r.counter * 1.25))
        // vertex(nw + r.counter * 2, nh - (r.counter * 1.25))
        // vertex(nw - r.counter * 2, nh - (r.counter * 1.25))
        // vertex(nw - r.counter * 2, nh + (r.counter * 1.25))

        // with aspect ratio calculation
        vertex(nw + r.counter * aspect_ratio, nh + (r.counter * 1))
        vertex(nw + r.counter * aspect_ratio, nh - (r.counter * 1))
        vertex(nw - r.counter * aspect_ratio, nh - (r.counter * 1))
        vertex(nw - r.counter * aspect_ratio, nh + (r.counter * 1))

        endShape(CLOSE)
    })  
}