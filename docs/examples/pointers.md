# Pointer syntax

A collection of pointer syntax.

```c++
ext::get("h*llo")** // points to 2.
ext::get("hello")*2 // points to 2.
ext::get("hel*[]lo")*[10-8] // points to 2.
```

```c++
ext::get("h*llo")**
ext::get("hello")*<anyinteger>
ext::get("hel*[]lo")*[<anycharacter>]
ext::get("hel*[]lo")
```
