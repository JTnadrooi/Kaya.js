# Import Statements

```c++
import ext;          // warns the runtime that namespace "ext" is expected.
import ext : ext2;   // same as above but also renames "ext" to "ext2".
import ext : ext, deb;   // compines namespaces "ext" and "deb" into "ext"
import ext2 : ext, deb;
```
