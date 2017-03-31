

module.exports = function(app) {

    var api = require('../controllers/apiController');

    app.route('/api')
        .post(api.send_email, function(req, res){

        });

}






