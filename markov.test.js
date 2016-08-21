var TEST_DATA = [
    'This little piggy went to the market',
    'This little piggy stayed home',
    'This little piggy had roast beef',
    'This little piggy had none',
    'And this little piggy went wee wee wee all the way home'
];

describe('initialization', function () {
    it('should create a new instance', function () {
        expect(window.Markov !== undefined).toBeTruthy();
    });
});

describe('generating strings', function () {
    it('should return a nonempty string given data', function (done) {
        var result;
        var markov = new Markov(TEST_DATA, function () {
            result = this.generate();
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
            done();
        });
    });
});
