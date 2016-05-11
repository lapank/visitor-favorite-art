//Things I learned:
// debugger;  shows you the global and local scope of things
// if you don't use your own functions, asyncronous functions are going to make your scopeing life hell
//$popUp.remove(); // better than  $popUp.css("display", "none"); because display:none would clog things up by keeping the pop-ups in the dom

//Summary:
//first you create a local data base for Comments
//then you build the display with all the little articles
//then you grab the artwork id and artwork description and attach it to the html element so you can use it during the onclick event
//with this artwork id you check your local comment database to see how long the array of comments associated with that id is.  This number is then appended to the dom
//when you click on an individual article the image, title, and description create html
//check database to see if there are any comments associated with the id (this could all happen in the beginning but thats bad performance)
//create HTML from the text assiciated with that ID.

$(document).ready(function(){
  var $blogLanding = $('#blog-landing');
  var $bodyContainer = $('#bodyContainer');
  var Comment = new ParseObjectType('Comment');  //create a new object for comments

  function getCommentsForPic(id, callback) {
    var matchingComments = [];  //create an empty array to fill later with comments associated with a particular artwork ID
    Comment.getAll(function(err, allComments) { //the "Get" part of crud
          // check for error
          for(var i = 0; i < allComments.length; i++){
            if(id === allComments[i].pictureID){ //where does allComments[i] come from?
              matchingComments.push(allComments[i]);
            }
          }

          callback(matchingComments);
      });
  }

  function setCommentCounts() {//resets the comment counter on every image
    $blogLanding.children('article').each(function() { //grab every article and attach a data-id attribute to it
      var $el = $(this);//$el is the element we're using
      var id = $el.attr('data-id');

      getCommentsForPic(id, function(matchingComments){
        $el.find('.comments').html('Comments:' + matchingComments.length); //this sets the article comment count to however long the array of comments retrieved is
      });
    });
  }//end of setCommentCounts function

  var url = 'https://api.collection.cooperhewitt.org/rest/?method=cooperhewitt.exhibitions.getObjects&access_token=515f2cac8963ac117af5d12395060827&exhibition_id=51669013&page=1&per_page=100'

  $.get(url, function(response){ //this is the bit where the initial api is built
    for (var i = 0; i < response.objects.length; i++){
      var id = response.objects[i].id;
      var title = response.objects[i].title;
      var shortDescription = response.objects[i].label_text;
      if(response.objects[i].images[0] === undefined){
        var image = 'images/not-available-n.png';
      }else{
        var image = response.objects[i].images[0].n.url;
      }

      var $voteUp = $('<i class="fa fa-thumbs-o-up" aria-hidden="true"> 0 </i>');
      var $voteDown = $('<i class="fa fa-thumbs-o-down" aria-hidden="true"> 0 <i>')
      var $article = $('<article class="white-panel">');
      $article.attr('data-id',id);  //this is you packing up this variable and placeing it into the html to be unpacked later (thus avoiding scope problems)
      $article.attr('data-description', shortDescription); //this is you packing up this variable and placeing it into the html to be unpacked later (thus avoiding scope problems)
      var $domImage = $('<img>');
      var $commentContainer = $('<div class="comment_container">');
      var $comments = $('<div class="comments">Comments:</div>');
      var $blogLanding = $('#blog-landing');
      var $bodyContainer = $('#bodyContainer');
      var $h1 = $('<h1>');

      $domImage.attr('src', image);
      $h1.html(title);
      $article.append($domImage);
      $article.append($h1);
      $article.append($commentContainer);
      $commentContainer.append($voteUp);
      $commentContainer.append($voteDown);
      $commentContainer.append($comments);
      $blogLanding.append($article);


    }//for loop

    setCommentCounts(); //since the articles have all been built this function now adds the data-id attribute to the html and checks to see if any comments are currently associated with that id
  });//get call

        $('body').on('click', 'article', function(){ //this is the onclick event that builds the popup window
          var image = $(this).find('img').attr('src'); //the next three lines are you grabbing variable values again (because scope hates you)
          var title = $(this).find('h1').html();//if you didn't do this step you would just get the last image title and id on all of the pop-ups
          var id = $(this).attr('data-id');
          var shortDescription = $(this).attr('data-description');// packed it and then unpacked it
          var $popUp = $('<div id="popUp">');
          var $closePopUp = $('<div class="closePopUp">X</div>');
          var $popUpImage = $('<img class="popup_image">');
          var $popUpTitle = $('<h1 class="popup_title">');
          var $popUpDescription = $('<div>');
          var $form = $('<form action="">');
          var $label = $('<label>Comment:</label>');
          var $textArea = $('<textarea type="text">');
          var $button = $('<button>Submit</button>');


         $popUpImage.attr('src', image);
         $popUpTitle.html(title);
         $popUp.append($popUpImage);
         $popUp.append($popUpTitle);
         $popUpDescription.html(shortDescription);
         $popUp.append($popUpDescription);
         $form.append($label);
         $form.append($textArea);
         $form.append($button);
         $popUp.append($form);
         $popUp.append($closePopUp);
         $bodyContainer.append($popUp);

         getCommentsForPic(id, function(matchingComments){ //
           for(var i = 0; i < matchingComments.length; i++){
             renderComment(matchingComments[i].text); //renderComment is defined on line 114, this grabs the text associated with each comment and builds the dom list
           }
         })

         $closePopUp.on("click", function(){
           $popUp.remove(); // better than  $popUp.css("display", "none"); because display:none would clog things up by keeping the pop-ups in the dom
           setCommentCounts();
            })//close popup

        function renderComment(text) { //this function builds the comment section of the popup
          var $ul = $('<ul>');
          var $li = $('<li>');
          $li.html(text);
          $ul.append($li);
          $popUp.append($ul);
        }

        $form.submit(function(event){
          event.preventDefault();
          var text = $textArea.val();
          var comment = Comment.create({ //the "Create" part of CRUD, when the form submits a new object is added to the Comment object
            pictureID: id,
            text: text
          }, function(err, result) {
              if (err) {
                  console.log(err);
              } else {
                  console.log(result);
              }
          });

          renderComment(text); //this bit shows the recently made comment on the page
          $textArea.val(''); //this bit clears the textArea
        })//form submit


      });// popUp click event




});//document ready


// ------------------------------Version 1: too many get requests----------------------------------------

// var token = '515f2cac8963ac117af5d12395060827';
//
// $(document).ready(function(){
//   var getall = function(callBack){
//     var url = 'https://api.collection.cooperhewitt.org/rest/?method=cooperhewitt.objects.getOnDisplay&access_token=' + token;
//     $.get(url, function(response){
//         callBack(response.objects);
//     })//get call
//   };//getall function
//
//   var getImages = function (id, token, callBack){
//     var images = 'https://api.collection.cooperhewitt.org/rest/?method=cooperhewitt.objects.getImages&access_token=' + token +'&object_id=' + id;
//     $.get(images, function(response){
//       callBack(response.images)
//      });//end of $.get
//   };
//
//   // var getDescription = function (id, callBack){
//   //   var images = 'https://api.collection.cooperhewitt.org/rest/?method=cooperhewitt.objects.getInfo&access_token='+token+'f&object_id=' + id;
//   //   $.get(images, function(response){
//   //     callBack(response.gallery_text)
//   //     console.log(response);
//   // }
//
//   var render = function (title, imageUrl){
//     var $voteUp = $('<i class="fa fa-thumbs-o-up" aria-hidden="true"> 0 </i>');
//     var $voteDown = $('<i class="fa fa-thumbs-o-down" aria-hidden="true"> 0 <i>')
//     var $article = $('<article class="white-panel">');
//     var $domImage = $('<img>');
//     var $commentContainer = $('<div class="comment_container">');
//     var $comments = $('<div class="comments">Comments:</div>');
//     $domImage.attr('src', imageUrl);
//     var $h1 = $('<h1>');
//     $h1.html(title);
//     $article.append($domImage);
//     $article.append($h1);
//     $article.append($commentContainer);
//     $commentContainer.append($voteUp);
//     $commentContainer.append($voteDown);
//     $commentContainer.append($comments);
//     $blogLanding.append($article);
//   };
//
//   var $blogLanding = $('#blog-landing');
//   var $bodyContainer = $('#bodyContainer');
//   // getall(function(objects){
//   //   objects.forEach(function(object){
//   //     getImages(object.id, function(images){
//   //       render(object.title, images[0].n.url);
//   //     })
//   //   })
//   // })
// render('bubba', 'https://images.collection.cooperhewitt.org/59830_0f5eb70719e0e1a4_n.jpg')
//
//
//         var renderPopUp = function(imageUrl, title){
//           var $popUp = $('<div id="popUp">');
//           var $closePopUp = $('<div class="closePopUp">X</div>');
//           var $popUpImage = $('<img>');
//           console.log(imageUrl);
//           $popUpImage.attr('src', imageUrl);
//           var $popUpTitle = $('<h1>');
//           $popUpTitle.html(title);
//           var $popUpDescription = $('<div>');
//           var $form = $('<form>');
//           var $label = $('<label>Comment:</label>');
//           var $textArea = $('<textarea>');
//           var $button = $('<button>Submit</button>');
//           // <!-- <form action="" id="message-form">
//           //   <div class="form-group">
//           //     <label>Message:</label>
//           //     <textarea id="message" type="text" class="form-control"></textarea>
//           //   </div>
//           //   <button class="btn btn-default">Post to board</button>
//           // </form> --
//           $popUp.append($popUpImage);
//           $popUp.append($popUpTitle);
//           $popUp.append($popUpDescription);
//           $form.append($label);
//           $form.append($textArea);
//           $form.append($button);
//           $popUp.append($form);
//
//           $popUp.append($closePopUp);
//           $bodyContainer.append($popUp);
//
//
//           // var info = 'https://api.collection.cooperhewitt.org/rest/?method=cooperhewitt.objects.getInfo&access_token='+token+'f&object_id=' + id;
//           // $.get(info, function(answer){
//           //   console.log(answer);
//           // });
//
//         $closePopUp.on("click", function(){
//           $popUp.css("display", "none");
//         })//close popup
//
//         };//end of renderpopUp function
//
//         $('body').on('click', 'article', function(){
//           var imageUrl = $(this).find('img').attr('src');
//           imageUrl.css('width', '100px');
//           var title = $(this).find('h1').html();
//           renderPopUp(imageUrl, title);
//         });
//
//
//         // ParseObjectType is a global function that allows you to create new object types!
//     var Comment = new ParseObjectType('comment');
//
//     // now you need to define some properties for the car
//     var property = { commentCount: 0 };
//
//     // now just call .create and pass in the props!
//     Comment.create(property, function(err, result) {
//         // if an error exists, read it in the console
//         if (err) {
//             console.log(err);
//         } else {
//            // otherwise, you'll get a result with the new object and an assigned objectId
//             console.log(result); // { wheelCount: 4, objectId: '10iedlfd' }
//         }
//     })//create comment
//
//     // Once we have an object's 'objectId', we can fetch that object based on it!
// Comment.getAll(function(err, comment) {
//     // check for error
//
//     // if there's no error, take a look at the vehicle object
//     console.log(comment); // { wheelCount: 4, objectId }
// });
//
//
//
// });//end of .ready function
