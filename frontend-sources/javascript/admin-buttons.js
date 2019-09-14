function suspendUser(userId){
  UIkit.modal.confirm('Suspend user?').then(function() {
      document.getElementById("button"+userId).disabled = true
      document.getElementById('suspend'+userId).submit()
  }, function () {
  })
}

function removeUser(userId){
  UIkit.modal.confirm('Delete user and all its content?').then(function() {
    document.getElementById('removeUser'+userId).submit()
    //location.reload()
    //document.getElementById('removeUserd'+userId).submit()
  }, function () {
  })
}