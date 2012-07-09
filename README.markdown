# nodeNES
[![Build Status](https://secure.travis-ci.org/gutomaia/nodeNES.png)](http://travis-ci.org/gutomaia/nodeNES)

A c6502 compiler for Nintendo 8 bits written in javascript.


## Goal

NodeNES is aimed to be compatible with NESASM. Overall every single instruction on the c6502 is already supported. However it is written with TDD, so its compabitlity is growing along with demos and examples provided as fixtures. Overrall every sin

## Test Driven Development

Tests are great and really guide this project. The compiler is 

## How to contribute

I will try to put a list of current issues in

## Authors and contributors
* [Gustavo Maia Neto (Guto Maia)](http://gutomaia.net)(Creator)
* [Klaus Silveira](http://www.klaussilveira.com)

## License
[New BSD license](http://www.opensource.org/licenses/bsd-license.php)

## Todo


* add more functionality, but keep the library simple and easy to use (loyal to it's name)
* create a better documentation (detail every method)
* error handling can, and should, be improved (throw decent exceptions)
* test, test, test (unit tests, of course!)

## Using SimpleString
The idea behind SimpleString is to keep things very easy to use, while giving lot's of power to the user. Check it out:

```php
<?php 

// Example
$string = new SimpleString('Lorem ipsum dolor sit amet lorem ipsum');
$string->shorten(10);
$string->toSentenceCase();
echo $string;

// Fluent interface example
$string = new SimpleString('Lorem ipsum dolor sit amet lorem ipsum');
$string->shorten(15)->toCamelCase();
echo $string;

/**
 * SimpleString also uses overloading to create an object-oriented
 * interface for built-in string functions. Functions starting with
 * str or str_ can just be used with their actual name, not prefix.
 * 
 * So: strtolower = tolower, str_replace = replace.
 * 
 * Functions whose return values are not string are invalid and will 
 * throw exceptions. 
 */
$string = new SimpleString('Lorem ipsum dolor sit amet lorem ipsum');
$string->tolower()->replace('lorem', 'mortem');
echo $string;


```