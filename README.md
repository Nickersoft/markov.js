# M A R K O V #

### What is Markov?
Markov is a small library for generating strings using Markov chains. [Markov chains](https://en.wikipedia.org/wiki/Markov_chain), by definition, "define a sequence of possible events in which the probability of each event depends only on the state attained in the previous event". These chains are often used to generate random strings by chaining text together from a pre-existing dataset. A cool example of these chains in action is the [What Would I Say?](http://what-would-i-say.com/) website, which uses your past Facebook posts to generate new, often nonsensical ones. This library is designed to make building those kinds of websites easier.

Using Markov is dead simple:

```javascript
var markov = new Markov(data, function () {
    markov.generate();
});
```

where `data` can either be a string dataset in the form of an array, or the path to a data file containing strings. This file must be either valid JSON or a list of strings separated by new lines. The constructor also takes a success callback which fires after the dataset has been successfully loaded. All `generate()` calls should be called in this callback. If you are loading a JSON file over AJAX, you can pass in a second callback which will fire if an error occurs loading the data from file.

If you need to add a string after the initial dataset has already loaded, simply call `add()`:

```javascript
markov.add('Hello world');
```

### Installing Markov
Markov is super simple to install. Just use NPM:

```
npm install markov.js
```

### Further Examples
This library can be rather confusing, here are a few more examples so you get the gist of using Markov:

#### Loading from an Array
```javascript
var markov = new Markov([
    'This little piggy went to the market',
    'This little piggy stayed home',
    'This little piggy had roast beef',
    'This little piggy had none',
    'And this little piggy went wee wee wee all the way home'
], function () {
    document.write(
        this.generate() // And this little piggy went to the way home
    );
});
```

#### Loading from a JSON File
```javascript
var markov = new Markov(
    'data.json',
    function () {
        document.write(this.generate());
    },
    function (status) {
        throw "Markov AJAX request errored with status code" + status;
    }
);
```
