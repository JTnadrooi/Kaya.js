# Logic

```js
class LineData {
    constructor(str) {
        // str = 'ext::writel("hello", "world")*|ext::writel("hello");'
        this.Calls = {}; // {'ext::writel("hello","world")*', 'ext::writel("hello")' } (trim the trailing ";" and split at the "|". )
    }
}

class Call {
    constructor(str) {
        // str = 'ext::writel("hello","world")*'
        this.Namespace = ""; // 'ext'
        this.Name = ""; // 'writel'
        this.Args = {}; // {'hello', 'world'}
        this.Pointer = {}; // 1 (amount of trailing *'s, in this case 1)
    }
}
```
