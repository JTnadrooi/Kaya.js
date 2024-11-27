# Statements

## Import

```ts
@import:ext;          // warns the runtime that namespace "ext" is expected.
@import:ext2 > ext;   // same as above but also renames "ext" to "ext2".
@import:[ext, deb] > ext;   // compines namespaces "ext" and "deb" into "ext"
@import:[ext, deb] > ext2;
```
