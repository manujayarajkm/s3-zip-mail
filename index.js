const Archiver =require( 'archiver');
const AWS =require( 'aws-sdk');
const { createReadStream } =require( 'fs');
const { Readable, Stream } =require( 'stream');


const zipFiles=async()=>{

const config=new AWS.Config({
    accessKeyId: 'AKIAQAFABRDVDHCAGCFU', secretAccessKey: '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', region: 'us-east-1'
  });

  const s3 = new AWS.S3();

  const bucketName = 'compression-testing';
  const zipFileName = 'zipper.zip';

  const keys=['006.jpg','Project.mp4'];

  const s3DownloadStreams = keys.map((key) => {
    return {
        stream: s3.getObject({ Bucket: bucketName, Key: key }).createReadStream(),
        filename: key,
    };
});


const streamPassThrough = new Stream.PassThrough()

const uploadParams = {
  ACL: "public-read", //change to private as per requirement
  Body: streamPassThrough,
  ContentType: "application/zip",
  Key: zipFileName,
}

const s3Upload = s3.upload(uploadParams, (err, data) => {
  if (err) console.error("upload error", err)
  else console.log("upload done", data)
})
const archive = Archiver("zip", {
  zlib: { level: 9 },
})
archive.on("error", error => {
  throw new Error(
    `${error.name} ${error.code} ${error.message} ${error.path}  ${error.stack}`
  )
})

s3Upload.on("httpUploadProgress", progress => {
    console.log(progress)
  })

  await new Promise((resolve, reject) => {
    s3Upload.on("close", resolve())
    s3Upload.on("end", resolve())
    s3Upload.on("error", reject())
  
    archive.pipe(streamPassThrough)
    s3DownloadStreams.forEach(s3FileDwnldStream => {
      archive.append(s3FileDwnldStream.stream, {
        name: s3FileDwnldStream.fileName,
      })
    })
     archive.finalize()
  }).catch(error => {
    throw new Error(`${error.code} ${error.message} ${error.data}`)
  })

}

zipFiles();