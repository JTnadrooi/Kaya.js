# Kaya.js

A fast and lightweight _Spellscript_ interpreter written entirely in JavaScript.

## Spellscript

<div style="text-align: center;">
  <img src="media/exampleImg.png" alt="example" style="width: 100%;">
</div>

_Spellscript_ is a procedural, library-dependent, interpreted programming language created by [JTnadrooi](https://github.com/JTnadrooi). It’s extremely lightweight and intended for straightforward, linear tasks.

## Examples

You can find examples in the _[examples](docs/examples)_ folder. Below is a description of these examples and what they demonstrate:

-   _`simple.spl`_: Describes _pointers_ and several methods from the (partially parsed) `_ext_` namespace.
-   _`readline.spl`_: Describes the asynchronous capabilities of Spellscript, _which differ from typical JavaScript-style async behavior and are more inline with c#_.
-   _`quiz.spl`_: Describes more advanced async functionality and demonstrates how Spellscript can be used to create a "simple" quiz. Also serves as a minor school project of mine.

All of these examples are able to be run with the [main.js](source/main.js) file. _(Although some may require the spellbooks from the [spellbooks](source/spellbooks) folder.)_

## Tests

Tests are available in the _[tests](docs/tests)_ folder. However, they are not yet executable. Currently, this folder is primarily used for experimenting with potential syntax for **_Spellscript v02_**.

---

_<sub>From now on, my benchmark for learning a language is: "Can I code a Spellscipt interpreter in it?"</sub>_
