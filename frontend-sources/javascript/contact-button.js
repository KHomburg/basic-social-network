function addContact(addForm){
    var removed = addForm.parentElement
    var addedForm = removed.nextElementSibling
    removed.classList.add("hidden")
    addedForm.classList.remove("hidden")
};

function removeContact(removeForm){
    var removeForm = removeForm.parentElement
    var addedForm = removeForm.previousElementSibling
    removeForm.classList.add("hidden")
    addedForm.classList.remove("hidden")
};