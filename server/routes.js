/*!
 * ./server/routes.js
 *
 * Declares the Express routes for the server
 * Authors: Abner Castro
 * Date: August 16th, 2017
 */

// context is updated for every request
const request = require("request");

var context = {};

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
        // Attach WorkspaceID to request object
        req.workspaceId = workspace;
        next();
    }
}

module.exports = (app, conversation) => {

    app.post('/api/message', CheckWorkspaceMiddleware, (req, res) => {

        let { content, recipient } = req.body.message;
        let input = {
            text: content,
            userName: recipient
        };
        var payload = {
            workspace_id: req.workspaceId,
            context: context,
            input: input || {}
        }
        conversation.message(payload, (err, data) => {
            if (err) {
                console.error(err);
                return res.status(err.code || 500).json(err);
            }
            context = data.context;
            const { actions } = data
            if (actions && actions.length > 0) {
                getFXRate(actions[0].parameters.url).then(function (val) {
                    data.output.text = [data.output.text[0].replace('{"cloud_functions_call_error":"The supplied authentication is invalid"}', '') + val.fxRate]
                    res.json(data)
                }).catch(function (err) {
                    res.json({ output: { text: 'Please try again' } })
                });
            } else {
                res.json(data);
            }

        });
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