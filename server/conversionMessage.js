var context = {};

const getConversionMessage = (conversation, req, callback) => {
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
            callback(err, null)
        }
        context = data.context;
        callback(null, data)
    });
}

module.exports = getConversionMessage