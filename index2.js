"use strict";

const s3Archiver = require('lambda-s3-archiver');
const aws = require('aws-sdk');
const config=new aws.Config({
    accessKeyId: 'AKIAQAFABRDVDHCAGCFU', secretAccessKey: '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', region: 'us-east-1'
  });

  const nodemailer = require('nodemailer');

const ses = new aws.SES({apiVersion: '2010-12-01',region: 'us-east-1'});
const s3 = new aws.S3();


const keys=['006.jpg','pptexamples.ppt'];
    const process=async() =>{

        const sourceBucket = 'compression-testing';
        const sourcePath = 'testing';
        const sourceFiles = keys;
        const outputFilename = 'outputFile';
        const outputFormat =  'zip';

        const result = await s3Archiver.archive(sourceBucket, sourcePath, sourceFiles, outputFilename, outputFormat);
        console.log(result);
    }

    // process();

const Buckt='compression-testing'
const key='testing/outputFile.zip';

    const getS3File=(bucket, keys)=> {
        console.log('params ',bucket,keys);
        return new Promise( (resolve, reject)=> {
            s3.getObject(
                {
                    Bucket: bucket,
                    Key: keys
                },
                 (err, data) =>{
                    if (err) return reject(err);
                    else return resolve(data);
                }
            );
        })
    }

    const sendMail=()=>{
        getS3File(Buckt, key)
        .then( (fileData)=> {
            const mailOptions = {
                from: 'manujayarajkm@gmail.com',
                subject: 'This is an email sent from a Lambda function!',
                html: `<p>You got a contact message from: <b>'MANU'</b></p>`,
                to: 'manujayarajkm@gmail.com',
                // bcc: Any BCC address you want here in an array,
                attachments: [
                    {
                        filename: "An Attachment.zip",
                        content: fileData.Body
                    }
                ]
            };

            console.log('Creating SES transporter');
            // create Nodemailer SES transporter
            var transporter = nodemailer.createTransport({
                SES: ses
            });

            // send email
            transporter.sendMail(mailOptions,  (err, info)=> {
                if (err) {
                    console.log(err);
                    console.log('Error sending email');
                    return(err);
                } else {
                    console.log('Email sent successfully');
                    return;
                }
            });
        })
        .catch( (error) =>{
            console.log(error);
            console.log('Error getting attachment from S3');
            return(err);
        });
    }

    sendMail();