# M A R K O V #

Markov is a small library for generating strings using Markov chains. [Markov chains](https://en.wikipedia.org/wiki/Markov_chain), by definition, "define a sequence of possible events in which the probability of each event depends only on the state attained in the previous event". These chains are often used to generate random strings by chaining text together from a pre-existing dataset. A cool example of these chains in action is the [What Would I Say?](http://what-would-i-say.com/) website, which uses your past Facebook posts to generate new, often nonsensical ones. Using Markov is dead simple really:

```javascript
var markov = new Markov(data);
var results = markov.generate();
```

where `data` is a string dataset in the form of an array. In the future, Markov should be capable of reading data directly from URLs, so no parsing is required beforehand. If you need to add a string after the initial dataset has already loaded, simply call `add()`:

```javascript
markov.add('Hello world');
```
