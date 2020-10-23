# babel-plugin-function-try-catch

a babel plugin can add try/catch to function automatically.

## Example

**In**

```js
// input code
```

**Out**

```js
"use strict";

// output code
```

## Installation

```sh
$ npm install babel-plugin-function-try-catch
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["function-try-catch"]
}
```

### Via CLI

```sh
$ babel --plugins function-try-catch script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["function-try-catch"]
});
```
