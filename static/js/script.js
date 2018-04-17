(function () {
  
  $(function () {
    
    // Events
    
    $('#register-form').submit(function (event) {
      
      event.preventDefault();
      var name = $('#name').val();
      var password = $('#password').val();
      var admin = $('#admin')[0].checked;
      ajaxFor.createUser(name, password, admin);
    });
    
    $('#list-body').ready(function () {
      ajaxFor.listUsers();
    });
    
    $('#login').submit(function (event) {
      
      event.preventDefault();
      var name = $('#name').val();
      var password = $('#password').val();
      ajaxFor.logUser(name, password);
    });
    
    $('#logout').click(function () {
      ajaxFor.logOut();
    });
    
    setTimeout(function () {
      $('#assignRoleButton').click(function () {
        
        var result = [];
        $('.list-group-item:not(.text-center)').each(function () {
          var is_admin = $(this).find('input[type=checkbox]')[0].checked;
          var id = $(this).find('span[hidden]').html();
          result.push({id: id, is_admin: is_admin});
        });
        
        
        ajaxFor.assignRoles(result);
      });
    }, 500);
    
    // Events End
    
    
    // AJAX Calls
    
    var ajaxFor = {
      createUser: function (name, password, admin) {
        var jsonData = JSON.stringify({name: name, password: password, admin: admin});
        $.ajax({
          method: 'POST',
          url: 'user',
          data: jsonData,
          dataType: 'json'
        })
            .done(function (msg) {
              alert(msg);
            });
      },
      
      
      assignRoles: function (result) {
        // send post req with id's of users and their corresponding admin values(boolean)
        $.ajax({
          url: 'assign_roles',
          method: 'POST',
          dataType: 'json',
          data: JSON.stringify(result)
        })
            .done(function (msg) {
              alert(msg);
              location.assign(location.origin);
            });
      },
      
      
      listUsers: function () {
        $.ajax({
          url: 'users',
          dataType: 'json'
        })
            .done(function (data) {
              
              var create = {
                
                checkboxes: function createCheckboxes() {
                  var span = document.createElement('span');
                  span.innerText = 'Is Admin ';
                  var cb = document.createElement('input');
                  cb.checked = data.users[i].admin;
                  cb.setAttribute('type', 'checkbox');
                  span.appendChild(cb);
                  span.setAttribute('class', 'float-right');
                  li.appendChild(span);
                  
                  // add id's in a hidden element
                  var hiddenElem = document.createElement('span');
                  hiddenElem.hidden = true;
                  hiddenElem.innerHTML = data.users[i].id;
                  li.appendChild(hiddenElem);
                },
                
                submitButton: function () {
                  var li2 = document.createElement('li');
                  var button = document.createElement('button');
                  button.setAttribute('class', 'btn btn-secondary');
                  button.setAttribute('id', 'assignRoleButton');
                  button.innerHTML = 'Submit';
                  li2.appendChild(button);
                  li2.setAttribute('class', 'list-group-item text-center');
                  userContainer.append(li2);
                }
                
              };
              
              
              var userContainer = $('#user-container');
              userContainer.html('');
              for (var i = 0; i < data.users.length; i++) {
                var color = data.users[i].admin ? 'list-group-item-primary' : 'list-group-item-secondary';
                var li = document.createElement('li');
                li.innerText = data.users[i].name;
                li.setAttribute('class', 'list-group-item ' + color);
                
                if (data.is_admin) {
                  create.checkboxes();
                }
                userContainer.append(li);
              }
              
              if (data.is_admin) {
                create.submitButton();
              }
            });
      },
      
      
      logUser: function (name, password) {
        var jsonData = JSON.stringify({name: name, password: password});
        $.ajax({
          method: 'POST',
          url: 'log_user',
          data: jsonData,
          dataType: 'json'
        })
            .done(function (data) {
              alert(data.msg);
              if (data.msg === 'Login Successful') location.assign(location.origin)
            });
      },
      
      
      logOut: function () {
        $.ajax({
          url: 'logout',
          dataType: 'json'
        })
            .done(function (msg) {
              alert(msg);
              location.assign(location.origin);
            });
      }
    };
    
    // AJAX Calls End
    
  })
})();
