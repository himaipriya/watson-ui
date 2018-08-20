const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

const tone_analyzer = new ToneAnalyzerV3({
    username: process.env.TONE_ANALYZER_USERNAME,
    password: process.env.TONE_ANALYZER_PASSWORD,
    version_date: "2018-08-20"
});

function getToneAnalyzerData(req, callback) {
    let { content } = req.body.message;
    tone_analyzer.tone({ text: content }, function (err, data) {
        if (err) {
            callback(err, null)
        }
        callback(null, data)
    });
}

module.exports = getToneAnalyzerData