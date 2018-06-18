# Waitful - an elegant way to use events and callbacks

## Introduction
It's sometimes annoying when using callbacks in web APIs, but you can do nothing about it. When it comes to block until a specific event, things get much worse.
```javascript
//For such cases
let img = new Image();
img.src = xxx;
img.onload = () => someCallback:shit:;
```
Waitful provides a better way to let those events join the chaining calls, using powerful promise in ES6 (or you may choose your own polyfill).

## Usage
#### Install
Just run `npm install waitful` or copy waitful.js to your project
#### Functions
```javascript
waitFor(<EventTarget> target, <String> event, <Object> options)
```
Will add a event listener to target and returns a Promise
```javascript
waitFirst(<Array|EventTarget> | Nodelist targets, <Array|String> | <String> events[, <Object> options])
```
Will add event listeners for each target, apply the same event if events is a string
Acts like `Promise.race()`
```javascript
waitAll(<Array|EventTarget> | Nodelist targets, <Array|String> | <String> events[, <Object> options])
```
Add event listeners for each target, apply the same event if events is a string
Acts like `Promise.all()`
```javascript
waitCallback(<Object> context, <Function> caller, <Array|Integer> positionOfCallback[, arguments])
```
A general function to convert callbacks into Promise
```javascript
mountPrototype()
```
See [With Prototype](#with-prototype)
#### Options
Only one available
`timeout`: time to expire
#### resolve and reject
`resolve`: The event triggered
`reject`: A message, one of
* ~~Finished: when waitFirst resolved/rejected~~
* Timeout: when no events happened
#### Demos
```javascript
import waitFor,waitFirst,waitAll from 'waitful'

//Log the event when onclick event teiggered
let element = document.getElementById('img')
waitFor(img, 'load').then(event => {
    console.log(event)
})

//If buttons are not clicked within 3000 ms, the listeners will be expired
let elements = document.querySelectorAll('.buttons')
waitAll(elements, 'click', {timeout: 3000}).catch(msg => {
    if(msg === 'Timeout') {
        console.log('You are not fast enough')
    }
})

//You can even block the function until event(s) triggered
async () => {
    let event = await waitFirst(elements, 'click')
    console.log(`Event happened at ${new Date(event.timeStamp)}`)
}
```
#### With prototype
> **WARNING: It can be dangerous to mount prototype**
> **AND NOT RECOMMENDED**

With `Import mountPrototype from 'waitful'`,
You can do it more naturally.

Currently only `EventTarget` have `waitFor` and `NodeList` have `waitFirst/waitAll`
```javascript
mountPrototype()

document.getElementById('demo')
    .waitFor('click'. {timeout: 3000})
    .catch(msg => {
        console.log(msg)
    })
    .then(e => {
        console.log(e.timeStamp)
    })
    
document.querySelectorAll('.targets')
    .waitFirst(['click', 'scroll', ...])
    .then(() => {
        console.log('Start loading resources')
        addSrcForImages()
        document.querySelectorAll('.img')
            .waitAll('load')
            .then(() => console.log('finished'), msg => console.log(msg))
    })
```
