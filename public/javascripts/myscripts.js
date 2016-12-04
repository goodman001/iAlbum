/*get url paras*/
function getPara(urlString){
   var arr=urlString.split("/");   
   return arr[arr.length-1];
}
function by(name){
 return function(o, p){
   var a, b;
   if (typeof o === "object" && typeof p === "object" && o && p) {
     a = o[name];
     b = p[name];
     if (a === b) {
       return 0;
     }
     if (typeof a === typeof b) {
       return a < b ? -1 : 1;
     }
     return typeof a < typeof b ? -1 : 1;
   }
   else {
     throw ("error");
   }
 }
}
(function(){
	var app = angular.module('myApp',[]);
	app.directive('fileModel', ['$parse', function ($parse) {
            return {
               restrict: 'A',
               link: function(scope, element, attrs) {
                  var model = $parse(attrs.fileModel);
                  var modelSetter = model.assign;
                  
                  element.bind('change', function(){
                     scope.$apply(function(){
                        modelSetter(scope, element[0].files[0]);
                     });
                  });
               }
            };
         }]);
      
        /* app.service('fileUpload', ['$http', function ($http) {
            this.uploadFileToUrl = function(file, uploadUrl){
               var fd = new FormData();
               fd.append('file', file);
            
               $http.post(uploadUrl, fd, {
                  transformRequest: angular.identity,
                  headers: {'Content-Type': undefined}
               })
            
               .success(function(){
               })
            
               .error(function(){
		  alert("Upload failure!");
               });
            }
         }]);*/
	app.controller('MainController', function ($scope, /*fileUpload,*/$http){
		$scope.user = {};
		$scope.logres = "";
		$scope.loginerr = "";
		$scope.friendlist = "";
		$scope.usename = "";
		$scope.pics = "";
		$scope.headflag0 = false;
		$scope.headflag1 = true;
		$scope.userflag = 0;//me 1 other 2 default = 0
		$scope.rightfootflag0 = true;
		$scope.rightdelflag = true;
		$scope.rightlikeflag = true;
		$scope.bigpicurl = "";
		$scope.bigpiclikedby = "";
		$scope.bigpicid = '';
		$scope.smallpics = false;
		$scope.bigpics = true;
		$scope.login = function(requestString)
		{
			//$scope.detaildata = response.data.results;
			/*
			$http.get(requestString).then(function (response) 
			{
				$scope.detaildata = response.data.results;
			}
			);*/
			//$scope.user = {};
			//alert($scope.user.username);
			if(!$scope.user.username || !$scope.user.password)
			{
				alert("You must enter username and password");
				return;
			}
			$http.post(requestString,$scope.user).then(function (response) 
            {
                $scope.logres = response.data.results;
				if($scope.logres.errmsg !="" && $scope.logres.errmsg != null && $scope.logres.errmsg !=undefined)
				{
					$scope.loginerr = $scope.logres.errmsg;
					$scope.headflag0 = false;
			        $scope.headflag1 = true;
					$scope.friendlist = "";
					$scope.username = "";
					
				}else
				{
					$scope.loginerr = "";
					$scope.friendlist = $scope.logres;
					$scope.username = $scope.friendlist[0].username;
					$scope.headflag0 = true;
					$scope.headflag1 = false;
				}
            });
		}
		$scope.init = function(requestString)
		{
			$http.get(requestString).then(function (response) {
			$scope.logres = response.data.results;
			if($scope.logres.errmsg !="" && $scope.logres.errmsg != null && $scope.logres.errmsg !=undefined)
			{
				$scope.loginerr = $scope.logres.errmsg
				$scope.headflag0 = false;
				$scope.headflag1 = true;
				$scope.friendlist = "";
				$scope.username = "";
			}else if($scope.logres != "")
			{
					$scope.loginerr = "";
					$scope.friendlist = $scope.logres;
					$scope.username = $scope.friendlist[0].username;
					$scope.headflag0 = true;
					$scope.headflag1 = false;
			}else
			{
				$scope.loginerr = "";
				$scope.headflag0 = false;
				$scope.headflag1 = true;
				$scope.friendlist = "";
				$scope.username = "";
			}
			$scope.pics = "";
				
			});
		}
		$scope.init('/init');
		$scope.logout = function(requestString){
			
			$http.get(requestString).then(function (response) 
			{
				$scope.logres = response.data.results;
				$scope.loginerr = "";
				$scope.headflag0 = false;
				$scope.headflag1 = true;
				$scope.friendlist = "";
				$scope.username = "";
				$scope.pics = "";
				$scope.rightfootflag0 = true;
				$scope.bigpics = true;
				
			});
			
			//$scope.init('/init');
		}
		$scope.uploadFile = function(requestString){
			var file = $scope.myFile;
			if(!file){
				alert("Please select your file firstly!");
				return;
			}
			//console.dir(file);
			var uploadUrl = "/uploadphoto";
			//fileUpload.uploadFileToUrl(file, uploadUrl);
			var fd = new FormData();
			fd.append('file', file);

			$http.post(uploadUrl, fd, {
			  transformRequest: angular.identity,
			  headers: {'Content-Type': undefined}
			})

			.success(function(msg){
			   //alert(msg.results);
			   $scope.getalbum(requestString);
			})
			.error(function(msg){
			alert(msg.results);
			});
		       
			   
		}
		$scope.getalbum = function(requestString){
			var result = getPara(requestString);
			$(".nava").each(function(){
				$(this).removeClass("clicka");
				//alert($(this).html());
				//alert($(this).attr("id"));
			});
			$("#"+result).addClass("clicka");
			//alert(result);
			if(result == '0')
			{
			$scope.rightfootflag0 = false;
			$scope.rightdelflag = false;
			$scope.rightlikeflag = true;
			$scope.userflag = 1;
			}else
			{
			$scope.rightfootflag0 = true;
			$scope.rightdelflag = true;
			$scope.rightlikeflag = false;
			$scope.userflag = 2;
			}
			$scope.smallpics = false;
			$scope.bigpics = true;
			$http.get(requestString).then(function (response)
			{
				$scope.pics = response.data.results.sort(by("picid"));
			});
			$scope.lefturl = requestString;
		       
		       
			
		}
		$scope.showpic = function(userflag,picid,picurl,likedb){
			$scope.bigpicurl = picurl;
			$scope.bigpicid = picid;
			$scope.bigpiclikedby = likedb;
			$scope.userflag = userflag;
			//alert(userflag);
			if(userflag == 1)
			{
				$scope.rightdelflag = false;
				$scope.rightlikeflag = true;
			}
			$scope.smallpics = true;
			$scope.bigpics = false;
			$scope.rightfootflag0 = true;
		}
		$scope.closepic = function(userflag){
			$scope.smallpics = false;
			$scope.bigpics = true;
			if(userflag ==1 )
			{
				$scope.rightfootflag0 = false;
			}else if(userflag ==2 )
			{
				$scope.rightfootflag0 = true;
			}
			else
			{
				 $scope.rightfootflag0 = true;
			}
			
			
		}
		$scope.deletephoto = function(requestString,lefturl){
			var r = confirm("Are you sure you want to delete this photo?");
			if(r == true)
			{
				$http.get(requestString).then(function (response)
		       	{
					$scope.delinfo = response.data.results;
					if($scope.delinfo != '')
					{
						alert($scope.delinfo);
					}else
					{
						$scope.getalbum(lefturl);
					}
					//alert($scope.delinfo);
					//$scope.lefturl = requestString;
		       	});
			}
			
			
		}
		$scope.updatelike = function(requestString,lefturl)
		{
			$http.get(requestString).then(function (response)
		       	{
					$scope.likedinfo = response.data.results;
					if($scope.likedinfo != '')
					{
						alert($scope.likedinfo);
					}else
					{
						$scope.getalbum(lefturl);
					}
					//alert($scope.delinfo);
					//$scope.lefturl = requestString;
		       	});
		}





	});//controller end




})();
