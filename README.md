# error-stack-handler

trace error call stack, filter unconcerned system call stack and node_modules locations,
locating the location of error happened in your project.
you can also use it to format error 

# install
```
npm install error-stack-handler --save=
```

# Usage
```
require('error-stack-handler')
```

before
```
{ Error: Could not find user
    at E:\someproject\node_modules\leancloud-storage\dist\node\request.js:163:17
    at tryCatch (E:\someproject\node_modules\es6-promise\dist\es6-promise.js:410:12)
    at invokeCallback (E:\someproject\node_modules\es6-promise\dist\es6-promise.js:425:13)
    at publish (E:\someproject\node_modules\es6-promise\dist\es6-promise.js:399:7)
    at publishRejection (E:\someproject\node_modules\es6-promise\dist\es6-promise.js:340:3)
    at flush (E:\someproject\node_modules\es6-promise\dist\es6-promise.js:128:5)
    at _combinedTickCallback (internal/process/next_tick.js:131:7)
    at process._tickDomainCallback (internal/process/next_tick.js:218:9)
```


after
```
{ Error: Could not find user.
    at UserController.login (E:\someproject\somedir\user.js:77:50)
    at UserController.login (E:\someproject\somedir\user.js:73:28)
    at <anonymous> (E:\someproject\server.js:77:5)
```

# API

default tracking stack depth is 10, error information at the nodecore and node_modules locations are filtered,
and the following API is provided if you need to configure it yourself

```
const esh = require('error-stack-handler')

// default true, set false will remove nodemoduleFilter from handler chain
esh.enableNodemoduleFilter = {boolean}

// default true, set false will remove nodecoreFilter from handler chain
esh.enableNodecoreFilter = {boolean}

// tracking stack depth,default 10
esh.traceLimit = {number}

// custom error message formatting, frames is an array of CallSite objects, view CallSite API on the V8 stack trace document
esh.formater = function(error, frames)

// appen a handler to the end of handler chain
esh.appendHandler(function(error, frames))

// put a handler to the start of handler chain
esh.prependHandler(function(error, frames))

// remove handler
esh.removeHandler(function)
```

# Example
default
```
require('error-stack-handler')
```
custom
```
const esh = require('error-stack-handler')

esh.enableNodecoreFilter = false
esh.enableNodemoduleFilter = false
// add handler
esh.appendHandler((err, frames) => {
    return frames.filter(function(callSite){
        const name = callSite && callSite.getFileName();
        return name && !name.includes('E:\\')
    })
})

// define formater
esh.formater = function(error, frames){
        return error.message + '\n  no stack out put'
    }
    
```