var express = require('express');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var router = express.Router();
var ObjectId = require('mongodb').ObjectID;
var fs = require('fs');
var Busboy = require('busboy');
//var pubdir = express.static("public");
/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(process.cwd() +"/public/index.html",{ title: 'Express' } );
  //res.render('/public/index.html', { title: 'Express' });
});

router.get('/init', function(req, res, next)
{
  var _id = req.cookies['userID'];
	if(!_id){
   	var results={'results':""};
		res.json(results);
		return;
  }
	var db = req.db;
  var users_collection = db.get('userList');
	users_collection.findOne({"_id":ObjectId(_id)}, function(error, re) {
    if( error )
		{
			var results={'results':{'errmsg':error}};
      res.json(results);
      console.log(error);
      return;
		}else
		{
      if(re){
        var username = re['username'];
        var t = 60 * 60 * 1000;
        //var results={'results':{"username":username,"password":"12345"}};
        //res.json(results);
        var sendmsg =  new Array();
        sendmsg[0] = {'username':username,'userID':0}
        users_collection.find({ username: { $in: re['friends'] } }, function(error, re) {
          if( error )
          {
            var results={'results':{'errmsg':error}};
            res.json(results);
            console.log(error);
            return;
          }
          for(var x=0;x<re.length;x++)
          {
                  sendmsg[x+1] = {'username':re[x].username,'userID':re[x]._id.toString()};
          }
          var results = {'results':sendmsg};
          //var results = {'results':[{'username':username,'userID':_id}]};
          res.json(results);
          //sendmsg.push({'username':username,'userID':_id});
          console.log(res.json(results));
          return;
        });}
			else
			{
				var results={'results':""};
        res.json(results);
        return;
			}
		}
	});
	
});
router.post('/login',urlencodedParser, function(req, res, next) {
  var username = req.body.username;
  var password = req.body.password;
  var db = req.db;
  var users_collection = db.get('userList');
  users_collection.findOne({username:username,password:password}, function(error, re) {
    if( error )
	  {
		  var results={'results':{'errmsg':error}};
      res.json(results);
		  //console.log(error);
		  return;
    }
    else
	  {
      if(re){
        var _id = re['_id'].toString();
        var t = 60 * 60 * 1000;
        res.cookie('userID', _id, { maxAge: t });

        //var results={'results':{"username":username,"password":"12345"}};
                //res.json(results);
        var sendmsg =  new Array();
        sendmsg[0] = {'username':username,'userID':0};
        users_collection.find({ username: { $in: re['friends'] } }, function(error, re) {
          if( error )
                  {
                        var results={'results':{'errmsg':error}};
                        res.json(results);
                        console.log(error);
                        return;
                  }
          for(var x=0;x<re.length;x++)
          {
            sendmsg[x+1] = {'username':re[x].username,'userID':re[x]._id.toString()};
          }
          /*
          for(x in re)
          {
            //console.log(x);
            sendmsg[x+1] = {'username':re[x].username,'userID':re[x]._id.toString()}; 

          }*/
          var results = {'results':sendmsg};
          //var results = {'results':[{'username':username,'userID':_id}]};
          res.json(results);
          //sendmsg.push({'username':username,'userID':_id});
          console.log(res.json(results));
          return;
        });
      }else
      {
        var results={'results':{'errmsg':"Login failure"}};
        res.json(results);
        console.log("no exist");
        return;
      }
	  }
  });
  
  //var username = req.body.username;
  //var results={'results':{"username":username,"password":"12345"}};
  //res.json(results);
  //console.log(results);
  //res.sendFile(process.cwd() +"/public/index.html",{ title: 'Express' } );
  //res.render(process.cwd() +"/public/index.html", { title: 'Express' });
});
router.get('/logout', function(req, res, next) {
  res.clearCookie('userID');
  var results={'results':""};
  res.json(results);
  //res.render('/public/index.html', { title: 'Express' });
});

router.post('/uploadphoto', function(req, res) {
	var _id = req.cookies['userID'];
	console.log(_id);
  if(!_id){
		res.writeHead(500);
    res.end('upload failure!');
    return;
  }
	var timestamp=new Date().getTime();
	var busboy = new Busboy({ headers: req.headers });
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    var saveTo = process.cwd() +"/public/uploads/" + timestamp + ".jpg";
    file.pipe(fs.createWriteStream(saveTo));
  });
  busboy.on('finish', function() {
    var db = req.db;
    var pic_collection = db.get('photoList');
    var data = {'url':'uploads/'+timestamp+".jpg",'userid':_id,'likedby':[]};
    pic_collection.insert(data, function(error, re) {
      if( error ){
        //res.writeHead(500);
        //res.end('database failure');
        var results={'results':error};
        res.json(results);
        return;
      }
      //console.log("insert!");
    });
    //res.writeHead(200);
    var results={'results':{'url':'uploads/'+timestamp+".jpg"}};
    res.json(results);
  });
  return req.pipe(busboy);
	//var tmp_path = req.files.thumbnail.path;
	
	//var target_path = process.cwd() +"/public/upload/a.jpg";
	/*var fstream;
	req.pipe(req.busboy);
	req.busboy.on('file', function (fieldname, file, filename) {
  console.log("Uploading: " + filename); 
  fstream = fs.createWriteStream(process.cwd() +"/public/upload/a.jpg");
  file.pipe(fstream);
  fstream.on('close', function () {
  res.redirect('back');
  });*/
	
});
router.get('/getalbum/:userid', function(req, res, next) {
	var userid = req.params.userid;
	if(userid == 0)
	{
		userid = req.cookies['userID'];
	}
	//console.log(userid);
	if(!userid){
		var results={'results':""};
		res.json(results);
		return;
	}
	console.log(userid);
	var db = req.db;
  var pic_collection = db.get('photoList');
	pic_collection.find({ 'userid':userid }, function(error, re) {
		if( error )
    {
      var results={'results':{'errmsg':error}};
      res.json(results);
      console.log(error);
      return;
    }
		var sendmsg =  new Array();
		for(var x=0;x<re.length;x++)
    {
       sendmsg[x] = {'picid':re[x]._id.toString(),'picurl':re[x].url,"likedby":re[x].likedby};
    }
		var results = {'results':sendmsg};
    res.json(results);
    console.log(res.json(results));
    return;
	});
});
router.get('/deletephoto/:photoid',function(req, res, next){
  //if (!req.body) return res.sendStatus(400)
  // create user in req.body 
  var photoid = req.params.photoid;
  var db = req.db;
  var pic_collection = db.get('photoList');
  pic_collection.findOne({"_id":ObjectId(photoid)}, function(error, re) {
  if( error )
  {
    var results={'results':error};
    res.json(results);
    console.log(error);
    return;
  }
  else
  {
    if(re)
    {
      var fileurl = re['url'];
      fs.unlink(process.cwd() +"/public/"+fileurl,function(err){
        if(err) 
        {
          var results={'results':err};
          res.json(results);
          return;
        }else
        {
          pic_collection.remove({"_id":ObjectId(photoid)}, function(err, re) {
            if(err)
            {
              var results={'results':err};
              res.json(results);
              return;
            }else
            {
              var results={'results':''};
              res.json(results);
              console.log('file deleted successfully');
              return;
            }
          });
          
        }
      });
    }else
    {
      var results={'results':'photoid is not existed in the database!'};
      res.json(results);
      return;
    }

  }
  });
  /*
  fs.unlink('./server/upload/my.csv',function(err){
        if(err) return console.log(err);
        console.log('file deleted successfully');
   });*/
});

router.get('/updatelike/:photoid',function(req, res, next){
  //if (!req.body) return res.sendStatus(400)
  // create user in req.body 
  var userid = req.cookies['userID'];
  if(!userid){
     var results={'results':"cookie is dead!"};
     res.json(results);
     return;
  }
  var likedby=new Array();
  var photoid = req.params.photoid;
  var db = req.db;
  var pic_collection = db.get('photoList');
  pic_collection.findOne({"_id":ObjectId(photoid)}, function(error, re) {
  if( error )
  {
    var results={'results':error};
    res.json(results);
    console.log(error);
    return;
  }
  else
  {
    if(re)
    {
      likedby =  re['likedby'];
      var users_collection = db.get('userList');
      users_collection.findOne({"_id":ObjectId(userid)}, function(error, re) {
        if( error )
        {
           var results={'results':error};
           res.json(results);
           console.log(error);
           return;
        }else
        {
          if(re){
            var flag_ = false;
            var username = re['username'];
            for (var i = 0; i < likedby.length; i++) {
                if (likedby[i] == username) {
                  flag_ = true;
                  break;
                }
            }
            if(flag_==false){
              console.log(likedby);
              likedby.push(username);
              //console.log(likedby);
              console.log(likedby);
              pic_collection.update({"_id":ObjectId(photoid)}, {$set: { "likedby": likedby}},function(error, re) {
                if(error)
                {
                  var results={'results':error};
                  res.json(results);
                  console.log(error);
                  return;
                }else
                {
                  var results={'results':''};
                  res.json(results);
                  return;
                }


              });
            }else
            {
              var results={'results':''};
              res.json(results);
              return;
            }
          }else
          {
            var results={'results':"username is null!"};
            res.json(results);
            return;
          }
        }

      });
      
    }else
    {
      var results={'results':'photoid is not existed in the database!'};
      res.json(results);
      return;
    }

  }
  });
  /*
  fs.unlink('./server/upload/my.csv',function(err){
        if(err) return console.log(err);
        console.log('file deleted successfully');
   });*/
});



/*
router.post('/login', urlencodedParser, function(req, res, next){
  //if (!req.body) return res.sendStatus(400)
  // create user in req.body 
  var username = req.body.username;
  console.log(username);
});*/
module.exports = router;
