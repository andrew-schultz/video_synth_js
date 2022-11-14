export const videoRectangle = () => {
    if (toggles['rectangleVideo']) {


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
        // var t = millis() / 3000
        // rotateY(180)
        // rotateZ(t/2)
        // rotate(t/2)

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
            
            // not perfect but it'll do
            rect(-100, -60, 200, 120);
            // sphere(50, 16, 16);
        }

        pop()
    }
}