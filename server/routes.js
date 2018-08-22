const request = require("request");
const async = require("async")
const getConversion = require('./conversionMessage')
const getTone = require('./toneAnalyzer')
const FEEL_GOOD = ['joy', 'analytical', 'confident', 'tentative']
const FEEL_BAD = ['anger', 'fear', 'sadness']

var CheckWorkspaceMiddleware = (req, res, next) => {
    var workspace = process.env.WORKSPACE_ID;
    if (!workspace || workspace === '<workspace-id>') {
        console.error('WORKSPACE ID not set');
        return res.json({
            'output': {
                'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable. Please refer to the ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple">README</a> documentation on how to set this variable. <br>' + 'Once a workspace has been defined the intents may be imported from ' + '<a href="https://github.com/watson-developer-cloud/conversation-simple/blob/master/training/car_workspace.json">here</a> in order to get a working application.'
            }
        });
    }
    else {
        req.workspaceId = workspace;
        next();
    }
}

module.exports = (app, conversation) => {

    app.post('/api/message', CheckWorkspaceMiddleware, (req, res) => {
        async.parallel({
            conversion: function (callback) {
                getConversion(conversation, req, callback)
            },
            tone: function (callback) {
                getTone(req, callback)
            }
        }, function (err, results) {
            if (err) {
                res.status(err.code || 500).json(err);
            }
            const data = results.conversion
            const { actions } = data
            if (getToneData(results.tone)) {
                data.output.text = ['Sorry for the problem']
                res.json(data);
            } else if (actions && actions.length > 0) {
                if (actions[0].name === "/himaipriya@gmail.com_dev/ATM") {
                    makeATMLocator(actions, res, data)
                } else {
                    makeFXRate(actions, res, data)
                }
            } else {
                res.json(data);
            }
        });
    });
}

function getToneData(toneList) {
    const { sentences_tone, document_tone } = toneList
    return (checkIsSentencesBad(sentences_tone) || checkIsDocumentBad(document_tone))
}

function checkIsSentencesBad(toneCollection) {
    let isCustomerBad = false
    if (toneCollection && toneCollection.length > 0) {
        toneCollection.forEach((tonesObj) => {
            isCustomerBad = tonesObj.tones.find(function (tone) {
                return FEEL_BAD.indexOf(tone.tone_id) > -1
            }) ? true : false
        })
    }
    return isCustomerBad
}

function checkIsDocumentBad(toneCollection) {
    if (toneCollection.tones && toneCollection.tones.length > 0) {
        return toneCollection.tones.find(function (tone) {
            return FEEL_BAD.indexOf(tone.tone_id) > -1
        }) ? true : false
    }
    return false
}

function makeATMLocator(actions, res, data) {
    getATMLocator(actions[0].parameters.url).then(function (val) {
        console.log(val)
        let atm = []
        val.data[0].Brand.map(function (atmObj) {
            let nAtm = {}
            nAtm.brandName = atmObj.BrandName
            nAtm.atmList = atmObj.ATM.slice(0, 5)
            atm.push(nAtm)
        })
        data.output.atm = atm
        res.json(data)
    }).catch(function (err) {
        res.json({ output: { text: 'Please try again' } })
    });
}

function getATMLocator(url) {
    const options = {
        url,
        json: true
    };
    return new Promise(function (resolve, reject) {
        request(options, function (err, resp) {
            if (err) {
                console.log(err);
                return reject({ err: err });
            }
            return resolve(resp.body);
        });
    });
}

function makeFXRate(actions, res, data) {
    getFXRate(actions[0].parameters.url).then(function (val) {
        data.output.text = [data.output.text[0].replace('{"cloud_functions_call_error":"The supplied authentication is invalid"}', '') + val.fxRate]
        res.json(data)
    }).catch(function (err) {
        res.json({ output: { text: 'Please try again' } })
    });
}

function getFXRate(url) {
    const options = {
        url,
        json: true
    };
    return new Promise(function (resolve, reject) {
        request(options, function (err, resp) {
            if (err) {
                console.log(err);
                return reject({ err: err });
            }
            return resolve({ fxRate: resp.body['Realtime Currency Exchange Rate']['5. Exchange Rate'] });
        });
    });
}