const natural = require('natural');

function analyzeSentiment(text) {
    const Analyzer = natural.SentimentAnalyzer;
    const stemmer = natural.PorterStemmer;
    const analyzer = new Analyzer('English', stemmer, 'afinn');
    const tokenizer = new natural.WordTokenizer();
    
    const tokenizedText = tokenizer.tokenize(text);
    const score = analyzer.getSentiment(tokenizedText);
    
    return {
        score: score,
        sentiment: score > 0 ? 'Positive' : score < 0 ? 'Negative' : 'Neutral'
    };
}

module.exports = analyzeSentiment;
