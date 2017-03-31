
import rp from 'request-promise';
import querystring from 'querystring';
import _ from 'lodash';
import {convertStringToArr} from '../utils/utils';

import config_dev from '../../config/app_DEV';
import config_pro from '../../config/app_PRO';

const development = global.__DEVELOPMENT__;

const createMailGunOption = (jsonObj) => {

    const url = (development) ? config_dev.EmailService.MailGun.url : config_pro.EmailService.MailGun.url;
    const apiKey = (development) ? config_dev.EmailService.MailGun.apiKey : config_pro.EmailService.MailGun.apiKey;
    const domain = (development) ? config_dev.EmailService.MailGun.domain : config_pro.EmailService.MailGun.domain;

    let params = {
        from: jsonObj.data.fromEmail,
        to: jsonObj.data.toEmail,
        cc: jsonObj.data.ccEmail,
        bcc: jsonObj.data.bccEmail,
        subject: jsonObj.data.subject,
        text: jsonObj.data.content
    }

    params = _.omitBy(params, _.isNil);//remove all items that are null

    var qString = querystring.stringify(params);
    const fullUrl = "https://api:" + apiKey + "@" + url + domain + "/messages?" + qString;


    let options = {
        method: 'POST',
        url: fullUrl,
        headers:{
            ContentType: 'application/json'
        },
        json: true // Automatically parses the JSON string in the response

    };

    return options;
};

const createSendGridOption = (jsonObj) => {

    const sg_url = (development) ? config_dev.EmailService.SendGrid.url : config_pro.EmailService.SendGrid.url; //'api.mailgun.net/v3/';
    const sg_apiKey = (development) ? config_dev.EmailService.SendGrid.apiKey : config_pro.EmailService.SendGrid.apiKey; //'key-941181e7a50f5d94bb298819e0c6c6a0';


    let to = convertStringToArr(jsonObj.data.toEmail);

    let params = {

        to: to,
        subject: jsonObj.data.subject,
        text: jsonObj.data.content,
        headers: {
            "X-Accept-Language": "en",
            "X-Mailer": "MyApp"
        }
    }

    if(jsonObj.data.ccEmail != null){
        let cc = convertStringToArr(jsonObj.data.ccEmail);
        params.cc = [{email: jsonObj.data.ccEmail}];
    }

    if(jsonObj.data.bccEmail != null){
        let bcc = convertStringToArr(jsonObj.data.bccEmail);
        params.bcc = [{email: jsonObj.data.bccEmail}];
    }



    let sg_options = {
        method: 'POST',
        url: sg_url,
        headers: {
            "authorization": sg_apiKey,
            "content-type": "application/json"
        },
        json: true, // Automatically parses the JSON string in the response
        body : {

            personalizations: [
                params
            ],

            from: {
                email: jsonObj.data.fromEmail,
            },
            content: [
                {
                    "type": "text/html",
                    "value":jsonObj.data.content
                }
            ]
        }


    };

    return sg_options;
}


const httpRequest = (options, jsonObj, res) => {

    rp(options)
        .then((result) => {
            // Process html...

            console.log(result);
            res.status(200).send({response: "success"});

        })
        .catch((err) => {


            if(!jsonObj.data.resent){
                jsonObj.data.resent = true;
                options = createSendGridOption(jsonObj);
                httpRequest(options, jsonObj, res);
            }else{
                console.log("error: have to try with send grid " + err );
                res.status(400).send({response: "Bad Request"});
            }



        });
}

export const send_email = (req, res) => {

    var body = "";
    req.on('data', (chunk) => {
        body += chunk;
    });

    req.on('end', () => {

        var jsonObj = JSON.parse(body);

        var options = createMailGunOption(jsonObj);
        jsonObj.data.resent = false;
        httpRequest(options, jsonObj, res);
    });

};




