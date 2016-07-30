/**
 * Markov
 * =======
 * A small library for generating strings using Markov chains
 *
 * License
 * -------
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Tyler Nickerson
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * @preserve
 */

(function (global, factory) {

    'use strict';

    /* Use AMD */
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return factory(global, global.document);
        });
    }
    /* Use CommonJS */
    else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory(global, global.document);
    }
    /* Use Browser */
    else {
        global.Markov = factory(global, global.document);
    }

})(typeof window !== 'undefined' ? window : this, function (w, d) {

    var Markov = function () {
        var

        self = this,

        strings = {
            beginning: [],
            ending: [],
            mappings: {}
        },

        // Last generated string
        prevString = '',

        /**
         * Selects a random item from a given array
         *
         * @param  {String[]} array
         * @return {String}
         */
        getRandomString = function (array) {
            return array[Math.floor(array.length * Math.random())];
        },

        /**
         * Trims the leading and trailing whitespace from a string
         *
         * @param  {String} string
         * @return {String}
         */
        trim = function (string) {
            return string.replace(/^\s+|\s+$/g, '');
        };

        /**
         * Loads string data from an array
         * Required before any generate() call
         *
         * @param  {String[]} array
         * @return {void}
         */
        self.load = function (array) {
            var i;
            for(i = 0; i < array.length; i++) {
                self.add(array[i]);
            }
        };

        /**
         * Adds a string to the dataset
         * @param {String} string
         * @return {Boolean} boolean denoting whether the string was successfully added
         */
        self.add = function (string) {
            var trimmed = trim(string);

            if (trimmed.length > 0) {
                // Tokenize the string into words
                words = trim(string).split(' ');

                // Add the first and last words to their
                // respective arrays
                strings.beginning.push(words[0]);
                strings.ending.push(words[words.length - 1]);

                // Loop through each word
                for(i = 0; i < words.length; i++) {
                    var current_word, next_word;

                    current_word = words[i];
                    next_word = words[i + 1];

                    // If we haven't reached the end of the string
                    if (next_word !== undefined) {
                        // Creating a mapping between each word and the word that follows it
                        if (strings.mappings.hasOwnProperty(current_word)) {
                            strings.mappings[current_word].push(next_word);
                        } else {
                            strings.mappings[current_word] = [next_word];
                        }
                    }
                }

                return true;
            }

            return false;
        };

        /**
         * Generates a Markov chain using the current dataset
         *
         * @return {String}
         */
        self.generate = function () {
            // Don't continue if there is no data
            if (strings.mappings.length <= 0) {
                throw "No strings to generate from (did you forget a load() call?)";
            } else {
                var word, string, returnStr;

                // Get a random word to begin the text with
                word = getRandomString(strings.beginning);
                string = [word];

                // Loop until we run out of words to use
                while(strings.mappings.hasOwnProperty(word)) {
                    word = getRandomString(strings.mappings[word]);
                    string.push(word);
                }
                console.log(strings);
                // Merge together the string array
                returnStr = string.join(' ');

                // Run it again if the string came back empty
                // or is a duplicate
                if ((returnStr.length == 0) ||
                    (returnStr == prevString)) {
                    returnStr = self.generate();
                }

                prevString = returnStr;

                return returnStr;
            }
        };

        // Load dataset if it was passed into the constructor
        if ((arguments.length === 1) &&
            (arguments[0].constructor === Array)) {
            self.load(arguments[0]);
        }
    };

    return Markov;

});
