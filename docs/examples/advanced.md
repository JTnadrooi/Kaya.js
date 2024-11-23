# Advanced SPL Example

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
