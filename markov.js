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

        PROCESSING_MAX_TIME = 100, // maximum time to spend processing an array element (in milliseconds)
        PROCESSING_WAIT_TIME = 20, // time to wait between processing array elements (in milliseconds)

        self = this,

        strings = {
            beginning: [],
            ending: [],
            mappings: {}
        },

        // Last generated string
        prevString = '',

        isString = function (obj) { return String(obj) === obj },
        isArray  = function (obj) { return obj.constructor === Array },

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
        },

        /**
         * Counts the elements in a dictionary
         * @param  {Dictionary} dict
         * @return {int}
         */
        count = function (dict) {
            var count = 0;
            for (key in dict) {
                if (dict.hasOwnProperty(key)) count++;
            }
            return count;
        },

        /**
         * Loads data from a JSON url
         *
         * @param  {String} url
         * @param  {Function} successHandler
         * @param  {Function} errorHandler
         * @return {void}
         */
        loadURL = function (url, onSuccess, onError) {
            var xhr, rtext;
            if (typeof XMLHttpRequest != 'undefined') {
                xhr = new XMLHttpRequest();
            } else {
                try {
                    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
                    xhr = new XMLHttpRequest();
                } catch (ex) {
                    xhr = new ActiveXObject('Microsoft.XMLHTTP');
                }
            }
            xhr.open('get', url, true);
            xhr.onreadystatechange = function() {
                var status, data;
                if (xhr.readyState == 4) { // readyState 4 = DONE
                    status = xhr.status;
                    if (status == 200) {
                        rtext = xhr.responseText;
                        try { // First try parsing as JSON
                            data = JSON.parse(rtext);
                        } catch (e) { // If not, assume raw text
                            data = rtext.split('\n');
                        }
                        loadArray(data, onSuccess);
                    } else {
                        onError && onError(status);
                        throw "Could not complete ajax request: errored with status code " + status +
                                "\n See https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/status " +
                                "for more information";
                    }
                }
            };
            xhr.send();
        },

        /**
         * Loads data from an array
         *
         * @param  {String[]} array
         * @return {void}
         */
        loadArray = function (array, callback) {
            var queue;
            queue = array.concat();

            setTimeout(function () {
                var endtime = +new Date() + PROCESSING_MAX_TIME;
                do {
                    chunk = queue.shift();
                    self.add(chunk);
                } while (queue.length > 0);

                if (queue.length > 0) {
                    setTimeout(arguments.callee, PROCESSING_WAIT_TIME);
                } else {
                    callback.call(self);
                }
            }, PROCESSING_WAIT_TIME);
        };

        /**
         * Loads string data from an array or JSON file
         * Required before any generate() call
         *
         * @param  {String[] or String} arg
         * @return {void}
         */
        self.load = function () {
            if (arguments.length > 0) {
                if (isArray(arguments[0])) {
                    loadArray(arguments[0], arguments[1]);
                } else if (isString(arguments[0])) {
                    loadURL(arguments[0], arguments[1], arguments[2]);
                } else {
                    throw "Invalid argument type. load() requires either an array of strings or the path to a " +
                        "JSON data file.";
                }
            } else {
                throw "No argument given. load() requires either an array of strings or the path to a " +
                    "JSON data file.";
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
         * @param {int} The maximum number of words in the string
         * @return {String}
         */
        self.generate = function () {
            // Don't continue if there is no data
            if (count(strings.mappings) <= 0) {
                throw "No strings to generate from (did you forget a load() call?)";
            } else {
                var word, string, return_str;

                // Get a random word to begin the text with
                word = getRandomString(strings.beginning);
                string = [word];

                // Loop until we run out of words to use
                while(strings.mappings.hasOwnProperty(word)) {
                    word = getRandomString(strings.mappings[word]);
                    string.push(word);
                }

                // Merge together the string array
                return_str = string.join(' ');

                // Run it again if the string came back empty
                // or is a duplicate
                if ((return_str.length == 0) ||
                    (return_str == prevString)) {
                    return_str = self.generate();
                }

                prevString = return_str;

                return return_str;
            }
        };

        // Load dataset if it was passed into the constructor
        if (arguments.length > 0) {
            self.load.apply(this, arguments);
        }
    };

    return Markov;

});
