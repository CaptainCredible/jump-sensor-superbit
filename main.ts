let myNumber = 0
let DEBUG = true

input.onButtonPressed(Button.B, function() {
    if(DEBUG){
        jumps++
        basic.showNumber(jumps,20)
    }
})

input.onButtonPressed(Button.A, function () {
    if (DEBUG) {
        jumps--
        basic.showNumber(jumps, 20)
    }
})

let allowedToCount = false
if(DEBUG){
    allowedToCount = true
}

basic.showNumber(myNumber, 100)
basic.showIcon(IconNames.StickFigure)
basic.clearScreen()
let jumped = false// jumped = true after high acc event and false after low acc event
let jumps = 0 //counter for jumps
let lowThresh = 400
let highThresh = 2000


let lowDurationThresh = 80
let highDurationThresh = 50

let wasLow = false
let wasHigh = false

let lowStart = 0
let highStart = 0

let myAvgArray = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 , 1, 1, 1]

led.plot(2,1)

function averaged(newVal: number){
    myAvgArray.pop()
    myAvgArray.unshift(newVal)
    let sum = myAvgArray.reduce((a, b) => a + b, 0);
    let average = sum / myAvgArray.length
    return average
}

function countJump(){
    if(allowedToCount){
        jumps++
    } else {
        music.playTone(550,50)
        music.playTone(440, 50)
    }
    if(DEBUG){
        radio.sendValue("jumps", jumps)
    }
}

radio.setGroup(1)

loops.everyInterval(5, function () {
    //let myAcc = input.acceleration(Dimension.Strength)
    let myAcc = Math.abs(input.acceleration(Dimension.Y))
    let myAvgAcc = averaged(myAcc)
    //serial.writeValue("raw", myAcc)
    //serial.writeValue("avg", myAvgAcc)
    if(DEBUG){
        //radio.sendValue("avg", myAvgAcc)
    }
    

// MEASURE HIGH ACCELERATION
    if(myAvgAcc>highThresh && !wasHigh){
        //went above high acceleration thresh
        wasHigh = true
        if (DEBUG) {
        //radio.sendValue("high", 1)
        }
        highStart = input.runningTime()
    } else if (myAvgAcc < highThresh && wasHigh){
        wasHigh = false
        if (DEBUG) {
        radio.sendValue("high", 0)
        }
        let highDuration = input.runningTime() - highStart
        if(highDuration > highDurationThresh){
            
            if(!jumped){
                jumped = true
                led.toggle(2, 1)
                led.toggle(2, 3)
                music.playTone(660, 10)
            } else {
                music.playTone(550, 10)
            }
        }
    }

// MEASURE WEIGHTLESSNESS
    if(myAvgAcc < lowThresh && !wasLow){
        //went below weightless thresh
        wasLow = true
        radio.sendValue("low", 1)
        lowStart = input.runningTime()
    } else if (myAvgAcc > lowThresh && wasLow){
        // came back from below weightless thresh
        wasLow = false
        if (DEBUG) {
        radio.sendValue("low", 0)
        }
        let lowDuration = input.runningTime() - lowStart
        if(lowDuration > lowDurationThresh && jumped){ // jumped = true after high acc event and false after low acc event
            music.playTone(880, 20)
            if(jumped){
                jumped = false
                led.toggle(2, 1)
                led.toggle(2, 3)
                countJump()
            }
        }
    }
})

radio.onReceivedValue(function(name: string, value: number) {
    if (name == "count") {
        basic.pause(myNumber * 2)
        radio.sendValue(myNumber.toString(), jumps)
        basic.showIcon(IconNames.Chessboard,1)
    }
    
    if (name == "reset") { // set counts to 0
        jumps = 0
        allowedToCount = true
    }
    
    if (name == "stop") { //STOP THE COUNT!!!
        allowedToCount = false
    }

    if(name == "start"){    //ALLOW COUNTING (maybe dont use)

    }

})