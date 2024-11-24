# Advanced SPL Example

## SPL1.1 (DEPRICATED)

This syntax is not supported in the current version.

```c++
void: main(Int32~1);										        //program entry pointInt32~0
	ext::writel(@1);                                                //write the main input on a new line
	ext::writel("hello world again");
	ext::get_something()*|ext::writel(*);
	ext::get_something()*|ext::get_something()**|ext::writel(*, **);
	&::stack_set(0, "some\svalue");								    //&; stack "namespace", allocate sperate memory..
	&::stack_get(0)*|ext::writel(*);						        //what would be nice to preserve pointers: ext:writel(*1) and &::getsize()*5
 	&::stack_getsize()*|ext::writel(*);
	&::func_getsize()*|ext::writel(*);
 	@::do(3, 4)*|ext::writel(*);								    //same as line above. (kind of..)

Int32: do(Int32~1, Int32~2);
	ext::writel(@1)|&::return(@1);
```

## SPL2.0

Syntax supported in the most recent version of the Kaya.js interpeter.

```c++
void: main(Int32~1); // entrypoint spl.
	ext::writel(@1); // display the input variable. (given writel converts it to a string automatically)
	ext::get_value1()*|ext::get_value2()*[1+1]|ext::writel(*, **);	// gets 2 values and displays them.
	ext::writel(*); // displays the first value of the line above.
	clear();
```
